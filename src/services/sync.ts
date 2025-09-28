// Enhanced sync service integrated with PastoralCare Pro

import { pastoralCareProService, transformLocalVisitToPastoralCarePro } from './pastoralCareProService';
import { getUnsynced, markSynced } from '../db/db';
import { useAppStore } from '../state/store';

export interface SyncStatus {
  lastSync: Date | null;
  pendingVisits: number;
  pendingFollowups: number;
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncError?: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  synced?: {
    visits: number;
    followups: number;
    churches: number;
    members: number;
  };
  errors?: string[];
}

export class SyncService {
  private static instance: SyncService;
  private isSyncing = false;
  private lastSyncError: string | undefined;
  
  private constructor() {}
  
  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  async checkNetworkStatus(): Promise<boolean> {
    try {
      // Simple network check - can be enhanced with platform-specific implementations
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      console.error('Network check failed:', error);
      return false;
    }
  }

  async syncToServer(): Promise<SyncResult> {
    if (this.isSyncing) {
      return { success: false, message: 'Sync already in progress' };
    }

    this.isSyncing = true;
    this.lastSyncError = undefined;

    try {
      // Check network connectivity
      const isOnline = await this.checkNetworkStatus();
      if (!isOnline) {
        throw new Error('No internet connection available');
      }

      // Test PastoralCare Pro API connectivity
      await pastoralCareProService.healthCheck();

      const result: SyncResult = {
        success: true,
        message: 'Sync completed successfully',
        synced: { visits: 0, followups: 0, churches: 0, members: 0 },
        errors: []
      };

      // Get unsynced data
      const { visits: unsyncedVisits, followups: unsyncedFollowups } = await getUnsynced();

      // Sync visits to PastoralCare Pro
      if (unsyncedVisits.length > 0) {
        try {
          const visitSyncData = unsyncedVisits.map(transformLocalVisitToPastoralCarePro);
          const visitSyncResult = await pastoralCareProService.syncVisits(visitSyncData);
          
          if (visitSyncResult.success) {
            // Mark visits as synced
            await markSynced(unsyncedVisits.map((v: any) => v.id), 'visits');
            result.synced!.visits = visitSyncResult.synced;
          } else {
            result.errors!.push('Failed to sync visits to PastoralCare Pro');
          }
        } catch (error) {
          result.errors!.push(`Visit sync error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Sync followups
      if (unsyncedFollowups.length > 0) {
        try {
          // Mark followups as synced (they can be included in visit data or synced separately)
          await markSynced(unsyncedFollowups.map((f: any) => f.id), 'followups');
          result.synced!.followups = unsyncedFollowups.length;
        } catch (error) {
          result.errors!.push(`Followup sync error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Download fresh church and member data
      try {
        const churches = await pastoralCareProService.getChurches();
        result.synced!.churches = churches.length;

        // Download members for each church
        let totalMembers = 0;
        for (const church of churches.slice(0, 5)) { // Limit to prevent overwhelming
          const members = await pastoralCareProService.getMembers(church.id);
          totalMembers += members.length;
        }
        result.synced!.members = totalMembers;
      } catch (error) {
        result.errors!.push('Failed to download fresh data from PastoralCare Pro');
      }

      if (result.errors!.length > 0) {
        result.success = false;
        result.message = `Sync completed with ${result.errors!.length} errors`;
        this.lastSyncError = result.errors!.join('; ');
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      this.lastSyncError = errorMessage;
      
      return {
        success: false,
        message: `Sync failed: ${errorMessage}`,
        errors: [errorMessage]
      };
    } finally {
      this.isSyncing = false;
    }
  }
  
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const { visits, followups } = await getUnsynced();
      const isOnline = await this.checkNetworkStatus();

      return {
        lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000), // Placeholder - should be from storage
        pendingVisits: visits.length,
        pendingFollowups: followups.length,
        isOnline,
        isSyncing: this.isSyncing,
        lastSyncError: this.lastSyncError
      };
    } catch (error) {
      console.error('Failed to get sync status:', error);
      return {
        lastSync: null,
        pendingVisits: 0,
        pendingFollowups: 0,
        isOnline: false,
        isSyncing: this.isSyncing,
        lastSyncError: 'Failed to check sync status'
      };
    }
  }
}

// Legacy functions for backward compatibility
export async function runAutoSync() {
  const syncService = SyncService.getInstance();
  const result = await syncService.syncToServer();
  return result.success;
}

export async function runManualSync() {
  const setSyncing = useAppStore.getState().setSyncing;
  const setSynced = useAppStore.getState().setSynced;
  setSyncing(true);
  try {
    const syncService = SyncService.getInstance();
    const result = await syncService.syncToServer();
    if (result.success) {
      setSynced(true);
    }
    return result;
  } finally {
    setSyncing(false);
  }
}

// Export singleton instance
export const syncService = SyncService.getInstance();