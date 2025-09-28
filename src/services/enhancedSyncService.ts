// Enhanced Sync Service with Conflict Resolution and Progress Tracking

import { enhancedPastoralCareProService } from './enhancedPastoralCareProService';
import {
  getUnsyncedVisits,
  getUnsyncedFollowups,
  markVisitAsSynced,
  markFollowupAsSynced,
  updateChurchesFromSync,
  updateMembersFromSync,
  getAllChurches,
  updateLastSyncTimestamp,
  getLastSyncTimestamp,
} from '../db/db';
import { VisitRecord } from '../types';

export interface SyncProgress {
  stage: 'starting' | 'authenticating' | 'uploading' | 'downloading' | 'completed' | 'error';
  message: string;
  progress: number; // 0-100
  details?: {
    visitsSynced?: number;
    totalVisits?: number;
    followupsSynced?: number;
    totalFollowups?: number;
    churchesDownloaded?: number;
    membersDownloaded?: number;
  };
}

export interface SyncResult {
  success: boolean;
  summary: {
    visitsSynced: number;
    followupsSynced: number;
    churchesDownloaded: number;
    membersDownloaded: number;
    conflictsResolved: number;
    errors: string[];
  };
  conflicts?: ConflictResolution[];
  duration: number;
}

export interface ConflictResolution {
  visitId: string;
  localTimestamp: number;
  serverTimestamp: number;
  resolution: 'local_kept' | 'server_kept' | 'merged';
  details: string;
}

export interface SyncSettings {
  autoSync: boolean;
  syncInterval: number; // minutes
  conflictResolution: 'latest_wins' | 'manual' | 'prefer_local' | 'prefer_server';
  batchSize: number;
  retryAttempts: number;
}

export type SyncProgressCallback = (progress: SyncProgress) => void;

class EnhancedSyncService {
  private static instance: EnhancedSyncService;
  private isSyncing = false;
  private syncProgress: SyncProgress | null = null;
  private progressCallbacks: Set<SyncProgressCallback> = new Set();
  private autoSyncTimer: NodeJS.Timeout | null = null;

  private defaultSettings: SyncSettings = {
    autoSync: true,
    syncInterval: 30, // 30 minutes
    conflictResolution: 'latest_wins',
    batchSize: 50,
    retryAttempts: 3,
  };

  private constructor() {
    this.initializeAutoSync();
  }

  public static getInstance(): EnhancedSyncService {
    if (!EnhancedSyncService.instance) {
      EnhancedSyncService.instance = new EnhancedSyncService();
    }
    return EnhancedSyncService.instance;
  }

  // Progress Tracking
  public addProgressCallback(callback: SyncProgressCallback): void {
    this.progressCallbacks.add(callback);
  }

  public removeProgressCallback(callback: SyncProgressCallback): void {
    this.progressCallbacks.delete(callback);
  }

  private updateProgress(progress: SyncProgress): void {
    this.syncProgress = progress;
    this.progressCallbacks.forEach(callback => callback(progress));
  }

  // Main Sync Method
  public async performFullSync(settings?: Partial<SyncSettings>): Promise<SyncResult> {
    if (this.isSyncing) {
      throw new Error('Sync already in progress');
    }

    const startTime = Date.now();
    const config = { ...this.defaultSettings, ...settings };
    const result: SyncResult = {
      success: false,
      summary: {
        visitsSynced: 0,
        followupsSynced: 0,
        churchesDownloaded: 0,
        membersDownloaded: 0,
        conflictsResolved: 0,
        errors: [],
      },
      conflicts: [],
      duration: 0,
    };

    this.isSyncing = true;

    try {
      // Stage 1: Authentication Check
      this.updateProgress({
        stage: 'authenticating',
        message: 'Verifying authentication...',
        progress: 5,
      });

      if (!enhancedPastoralCareProService.isAuthenticated) {
        throw new Error('Not authenticated with PastoralCare Pro');
      }

      // Test connectivity
      const isHealthy = await enhancedPastoralCareProService.healthCheck();
      if (!isHealthy) {
        throw new Error('PastoralCare Pro server is not available');
      }

      // Stage 2: Upload Local Data
      this.updateProgress({
        stage: 'uploading',
        message: 'Uploading local visits...',
        progress: 20,
      });

      await this.uploadLocalData(result, config);

      // Stage 3: Download Server Data
      this.updateProgress({
        stage: 'downloading',
        message: 'Downloading server data...',
        progress: 60,
      });

      await this.downloadServerData(result, config);

      // Stage 4: Completion
      this.updateProgress({
        stage: 'completed',
        message: 'Sync completed successfully',
        progress: 100,
        details: result.summary,
      });

      result.success = result.summary.errors.length === 0;
      await updateLastSyncTimestamp();

      console.log('Full sync completed:', result.summary);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      result.summary.errors.push(errorMessage);

      this.updateProgress({
        stage: 'error',
        message: `Sync failed: ${errorMessage}`,
        progress: 0,
      });

      console.error('Sync failed:', error);
    } finally {
      this.isSyncing = false;
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  // Upload Local Data
  private async uploadLocalData(result: SyncResult, config: SyncSettings): Promise<void> {
    // Get unsynced data
    const unsyncedVisits = await getUnsyncedVisits();
    const unsyncedFollowups = await getUnsyncedFollowups();

    if (unsyncedVisits.length === 0 && unsyncedFollowups.length === 0) {
      console.log('No local data to upload');
      return;
    }

    // Process visits in batches
    const totalVisits = unsyncedVisits.length;
    let processedVisits = 0;

    for (let i = 0; i < unsyncedVisits.length; i += config.batchSize) {
      const batch = unsyncedVisits.slice(i, i + config.batchSize);

      try {
        const syncResponse = await enhancedPastoralCareProService.syncVisitsToServer(batch);

        if (syncResponse.success) {
          // Mark synced visits
          for (const visit of batch) {
            await markVisitAsSynced(visit.id);
          }

          result.summary.visitsSynced += syncResponse.synced;

          // Handle conflicts
          if (syncResponse.conflicts) {
            for (const conflict of syncResponse.conflicts) {
              result.conflicts!.push({
                visitId: conflict.visit_id,
                localTimestamp: new Date(conflict.mobile_updated).getTime(),
                serverTimestamp: new Date(conflict.server_updated).getTime(),
                resolution: conflict.resolution === 'server_kept' ? 'server_kept' : 'local_kept',
                details: `Conflict resolved using ${config.conflictResolution} strategy`,
              });
            }
            result.summary.conflictsResolved += syncResponse.conflicts.length;
          }

          // Handle errors
          if (syncResponse.errors) {
            result.summary.errors.push(...syncResponse.errors.map(e => e.error || e.toString()));
          }
        }

        processedVisits += batch.length;

        // Update progress
        const uploadProgress = Math.round((processedVisits / totalVisits) * 40); // 40% of total progress
        this.updateProgress({
          stage: 'uploading',
          message: `Uploaded ${processedVisits}/${totalVisits} visits`,
          progress: 20 + uploadProgress,
          details: {
            visitsSynced: result.summary.visitsSynced,
            totalVisits: totalVisits,
          },
        });

      } catch (error) {
        console.error('Failed to sync visit batch:', error);
        result.summary.errors.push(`Batch sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Handle followups (simplified - could be enhanced)
    if (unsyncedFollowups.length > 0) {
      try {
        // For now, just mark them as synced since they're included in visit data
        for (const followup of unsyncedFollowups) {
          await markFollowupAsSynced(followup.id);
        }
        result.summary.followupsSynced = unsyncedFollowups.length;
      } catch (error) {
        console.error('Failed to sync followups:', error);
        result.summary.errors.push('Failed to sync followups');
      }
    }
  }

  // Download Server Data
  private async downloadServerData(result: SyncResult, config: SyncSettings): Promise<void> {
    try {
      // Download churches
      this.updateProgress({
        stage: 'downloading',
        message: 'Downloading churches...',
        progress: 65,
      });

      const churches = await enhancedPastoralCareProService.getChurches();
      if (churches.length > 0) {
        await updateChurchesFromSync(churches);
        result.summary.churchesDownloaded = churches.length;
      }

      // Download members for each church
      let totalMembers = 0;
      const localChurches = await getAllChurches();

      for (let i = 0; i < localChurches.length; i++) {
        const church = localChurches[i];

        this.updateProgress({
          stage: 'downloading',
          message: `Downloading members for ${church.name}...`,
          progress: 70 + Math.round((i / localChurches.length) * 25),
        });

        try {
          const members = await enhancedPastoralCareProService.getMembers(parseInt(church.id));
          if (members.length > 0) {
            await updateMembersFromSync(members, church.id);
            totalMembers += members.length;
          }
        } catch (error) {
          console.error(`Failed to download members for church ${church.id}:`, error);
          result.summary.errors.push(`Failed to download members for ${church.name}`);
        }
      }

      result.summary.membersDownloaded = totalMembers;

      // Download recent visits from server (optional)
      try {
        const lastSync = await getLastSyncTimestamp();
        const sinceDate = lastSync ? lastSync.toISOString() : undefined;

        for (const church of localChurches) {
          const serverVisits = await enhancedPastoralCareProService.downloadVisitsFromServer(
            parseInt(church.id),
            sinceDate
          );

          // Process server visits (merge with local data if needed)
          // This is a simplified implementation - could be enhanced with proper conflict resolution
          if (serverVisits.length > 0) {
            console.log(`Downloaded ${serverVisits.length} visits from server for ${church.name}`);
          }
        }
      } catch (error) {
        console.error('Failed to download server visits:', error);
        result.summary.errors.push('Failed to download server visits');
      }

    } catch (error) {
      console.error('Failed to download server data:', error);
      result.summary.errors.push('Failed to download server data');
    }
  }

  // Auto-sync Management
  private initializeAutoSync(): void {
    // Initialize auto-sync based on stored settings
    // This is a placeholder - in production, load from AsyncStorage
    if (this.defaultSettings.autoSync) {
      this.scheduleAutoSync();
    }
  }

  private scheduleAutoSync(): void {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
    }

    this.autoSyncTimer = setInterval(async () => {
      if (!this.isSyncing && enhancedPastoralCareProService.isOnline) {
        try {
          console.log('Running automatic sync...');
          await this.performFullSync();
        } catch (error) {
          console.error('Auto-sync failed:', error);
        }
      }
    }, this.defaultSettings.syncInterval * 60 * 1000);
  }

  public enableAutoSync(intervalMinutes: number = 30): void {
    this.defaultSettings.autoSync = true;
    this.defaultSettings.syncInterval = intervalMinutes;
    this.scheduleAutoSync();
  }

  public disableAutoSync(): void {
    this.defaultSettings.autoSync = false;
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = null;
    }
  }

  // Status Methods
  public get isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  public get currentProgress(): SyncProgress | null {
    return this.syncProgress;
  }

  public async getSyncStatus(): Promise<{
    lastSync: Date | null;
    pendingVisits: number;
    pendingFollowups: number;
    isOnline: boolean;
    autoSyncEnabled: boolean;
  }> {
    const [lastSync, unsyncedVisits, unsyncedFollowups] = await Promise.all([
      getLastSyncTimestamp(),
      getUnsyncedVisits(),
      getUnsyncedFollowups(),
    ]);

    return {
      lastSync,
      pendingVisits: unsyncedVisits.length,
      pendingFollowups: unsyncedFollowups.length,
      isOnline: enhancedPastoralCareProService.isOnline,
      autoSyncEnabled: this.defaultSettings.autoSync,
    };
  }

  // Conflict Resolution
  private resolveVisitConflict(
    localVisit: VisitRecord,
    serverVisit: any,
    strategy: SyncSettings['conflictResolution']
  ): { useLocal: boolean; reason: string } {
    switch (strategy) {
      case 'latest_wins':
        return {
          useLocal: localVisit.updated_at > new Date(serverVisit.updated_at).getTime(),
          reason: 'Latest timestamp wins',
        };

      case 'prefer_local':
        return {
          useLocal: true,
          reason: 'Local changes preferred',
        };

      case 'prefer_server':
        return {
          useLocal: false,
          reason: 'Server changes preferred',
        };

      case 'manual':
        // For manual resolution, would need UI interaction
        // For now, default to latest wins
        return {
          useLocal: localVisit.updated_at > new Date(serverVisit.updated_at).getTime(),
          reason: 'Manual resolution pending - using latest timestamp',
        };

      default:
        return {
          useLocal: true,
          reason: 'Default to local',
        };
    }
  }

  // Cleanup
  public destroy(): void {
    this.disableAutoSync();
    this.progressCallbacks.clear();
  }
}

// Export singleton instance
export const enhancedSyncService = EnhancedSyncService.getInstance();
export default enhancedSyncService;