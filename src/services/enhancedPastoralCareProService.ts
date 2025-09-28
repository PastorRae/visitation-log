// Enhanced PastoralCare Pro API Integration Service
// Production-ready service with comprehensive error handling and offline support

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { Platform } from 'react-native';

// Configuration
const API_CONFIG = {
  baseUrl: __DEV__
    ? 'http://10.0.2.2:5000'  // Android emulator
    : 'https://api.pastoralcarepro.com',
  timeout: 15000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: '@pastoral_care_pro:auth_token',
  USER_DATA: '@pastoral_care_pro:user_data',
  LAST_SYNC: '@pastoral_care_pro:last_sync',
  OFFLINE_QUEUE: '@pastoral_care_pro:offline_queue',
  CACHED_CHURCHES: '@pastoral_care_pro:cached_churches',
  CACHED_MEMBERS: '@pastoral_care_pro:cached_members',
};

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    church_id: number;
    role: string;
  };
  expires_in: number;
}

export interface SyncOperation {
  id: string;
  type: 'visit_sync' | 'member_download' | 'church_download';
  data: any;
  timestamp: number;
  retries: number;
}

export interface NetworkStatus {
  isConnected: boolean;
  type: string;
  isInternetReachable: boolean | null;
}

class EnhancedPastoralCareProService {
  private authToken: string | null = null;
  private userData: any = null;
  private networkStatus: NetworkStatus = {
    isConnected: false,
    type: 'unknown',
    isInternetReachable: null
  };

  constructor() {
    this.initializeNetworkMonitoring();
    this.loadStoredAuth();
  }

  // Authentication Management
  async authenticate(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest<AuthResponse>('/auth/mobile', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success) {
        this.authToken = response.token;
        this.userData = response.user;

        // Store authentication data
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.AUTH_TOKEN, response.token],
          [STORAGE_KEYS.USER_DATA, JSON.stringify(response.user)],
        ]);

        console.log('Authentication successful:', response.user.email);
      }

      return response;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    this.authToken = null;
    this.userData = null;

    // Clear stored data
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);

    console.log('User logged out');
  }

  async refreshToken(): Promise<boolean> {
    try {
      if (!this.authToken) return false;

      // For JWT tokens, we can decode and check expiry
      const tokenData = this.decodeJWT(this.authToken);
      if (!tokenData || tokenData.exp * 1000 > Date.now()) {
        return true; // Token still valid
      }

      // If token expired, clear auth and return false
      await this.logout();
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.logout();
      return false;
    }
  }

  // Data Synchronization
  async syncVisitsToServer(visits: any[]): Promise<{
    success: boolean;
    synced: number;
    errors: any[];
    conflicts: any[];
  }> {
    if (!this.networkStatus.isConnected) {
      // Queue for later sync
      await this.queueOfflineOperation({
        id: `sync_visits_${Date.now()}`,
        type: 'visit_sync',
        data: { visits },
        timestamp: Date.now(),
        retries: 0
      });

      return {
        success: false,
        synced: 0,
        errors: ['No internet connection - queued for later sync'],
        conflicts: []
      };
    }

    try {
      const response = await this.makeRequest<any>('/visits/sync', {
        method: 'POST',
        body: JSON.stringify({ visits }),
      });

      console.log(`Visit sync completed: ${response.synced}/${visits.length}`);
      return response;
    } catch (error) {
      console.error('Visit sync failed:', error);

      // Queue for retry if it's a network error
      if (this.isNetworkError(error)) {
        await this.queueOfflineOperation({
          id: `sync_visits_${Date.now()}`,
          type: 'visit_sync',
          data: { visits },
          timestamp: Date.now(),
          retries: 0
        });
      }

      throw error;
    }
  }

  async downloadVisitsFromServer(churchId?: number, since?: string): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (churchId) params.append('church_id', churchId.toString());
      if (since) params.append('since', since);
      params.append('limit', '500'); // Increase limit for mobile

      const response = await this.makeRequest<{
        success: boolean;
        data: any[];
        server_timestamp: string;
      }>(`/visits/download?${params}`);

      if (response.success) {
        // Update last sync timestamp
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, response.server_timestamp);
        console.log(`Downloaded ${response.data.length} visits from server`);
        return response.data;
      }

      return [];
    } catch (error) {
      console.error('Visit download failed:', error);
      return [];
    }
  }

  async getChurches(): Promise<any[]> {
    try {
      // Try to get from cache first
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_CHURCHES);
      if (cached && !this.networkStatus.isConnected) {
        return JSON.parse(cached);
      }

      const response = await this.makeRequest<{
        success: boolean;
        data: any[];
      }>('/churches');

      if (response.success) {
        // Cache the result
        await AsyncStorage.setItem(
          STORAGE_KEYS.CACHED_CHURCHES,
          JSON.stringify(response.data)
        );
        return response.data;
      }

      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to get churches:', error);

      // Return cached data if available
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_CHURCHES);
      return cached ? JSON.parse(cached) : [];
    }
  }

  async getMembers(churchId: number, search?: string): Promise<any[]> {
    try {
      const cacheKey = `${STORAGE_KEYS.CACHED_MEMBERS}_${churchId}`;

      // Try cache first if offline
      if (!this.networkStatus.isConnected) {
        const cached = await AsyncStorage.getItem(cacheKey);
        let members = cached ? JSON.parse(cached) : [];

        // Apply local search filter
        if (search && search.length >= 2) {
          const searchLower = search.toLowerCase();
          members = members.filter((member: any) =>
            member.first_name.toLowerCase().includes(searchLower) ||
            member.last_name.toLowerCase().includes(searchLower)
          );
        }

        return members;
      }

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('limit', '500');

      const response = await this.makeRequest<{
        success: boolean;
        data: any[];
      }>(`/members/${churchId}?${params}`);

      if (response.success) {
        // Cache only if not a search query
        if (!search) {
          await AsyncStorage.setItem(cacheKey, JSON.stringify(response.data));
        }
        return response.data;
      }

      return [];
    } catch (error) {
      console.error('Failed to get members:', error);

      // Return cached data if available
      const cacheKey = `${STORAGE_KEYS.CACHED_MEMBERS}_${churchId}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : [];
    }
  }

  async searchMembers(query: string, churchId?: number): Promise<any[]> {
    try {
      if (query.length < 2) return [];

      const params = new URLSearchParams();
      params.append('q', query);
      if (churchId) params.append('church_id', churchId.toString());

      const response = await this.makeRequest<{
        success: boolean;
        data: any[];
      }>(`/members/search?${params}`);

      return response.success ? response.data : [];
    } catch (error) {
      console.error('Member search failed:', error);
      return [];
    }
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest<{
        status: string;
      }>('/health');

      return response.status === 'healthy';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Network and Offline Management
  private initializeNetworkMonitoring(): void {
    this.checkNetworkStatus();

    // Check network status periodically
    setInterval(() => {
      this.checkNetworkStatus();
    }, 10000); // Check every 10 seconds
  }

  private async checkNetworkStatus(): Promise<void> {
    try {
      const networkState = await Network.getNetworkStateAsync();
      const prevConnected = this.networkStatus.isConnected;

      this.networkStatus = {
        isConnected: networkState.isConnected ?? false,
        type: networkState.type?.toString() ?? 'unknown',
        isInternetReachable: networkState.isInternetReachable ?? null
      };

      // If we just came online, process offline queue
      if (!prevConnected && this.networkStatus.isConnected) {
        this.processOfflineQueue();
      }

      console.log('Network status:', this.networkStatus);
    } catch (error) {
      console.error('Failed to check network status:', error);
      // Fallback to assuming connected
      this.networkStatus = {
        isConnected: true,
        type: 'unknown',
        isInternetReachable: null
      };
    }
  }

  private async loadStoredAuth(): Promise<void> {
    try {
      const [token, userData] = await AsyncStorage.multiGet([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);

      if (token[1]) {
        this.authToken = token[1];
      }

      if (userData[1]) {
        this.userData = JSON.parse(userData[1]);
      }

      // Validate token
      if (this.authToken && !(await this.refreshToken())) {
        console.log('Stored token expired');
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    }
  }

  private async queueOfflineOperation(operation: SyncOperation): Promise<void> {
    try {
      const existingQueue = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      const queue: SyncOperation[] = existingQueue ? JSON.parse(existingQueue) : [];

      queue.push(operation);

      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
      console.log('Operation queued for offline sync:', operation.type);
    } catch (error) {
      console.error('Failed to queue offline operation:', error);
    }
  }

  private async processOfflineQueue(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      if (!queueData) return;

      const queue: SyncOperation[] = JSON.parse(queueData);
      const processedIds: string[] = [];

      for (const operation of queue) {
        try {
          if (operation.retries >= 3) {
            console.log('Max retries reached for operation:', operation.id);
            processedIds.push(operation.id);
            continue;
          }

          switch (operation.type) {
            case 'visit_sync':
              await this.syncVisitsToServer(operation.data.visits);
              processedIds.push(operation.id);
              break;
            default:
              console.log('Unknown operation type:', operation.type);
              processedIds.push(operation.id);
          }
        } catch (error) {
          console.error('Failed to process queued operation:', error);
          operation.retries += 1;
        }
      }

      // Remove processed operations
      const remainingQueue = queue.filter(op => !processedIds.includes(op.id));
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(remainingQueue));

      console.log(`Processed ${processedIds.length} offline operations`);
    } catch (error) {
      console.error('Failed to process offline queue:', error);
    }
  }

  // HTTP Request Management
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_CONFIG.baseUrl}/api/mobile${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': `VisitationLog-Mobile/${Platform.OS}`,
      ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
      ...options.headers,
    };

    const requestOptions: RequestInit = {
      ...options,
      headers,
      signal: AbortSignal.timeout(API_CONFIG.timeout),
    };

    let lastError: Error = new Error(); // Initialized lastError here

    for (let attempt = 1; attempt <= API_CONFIG.retryAttempts; attempt++) {
      try {
        console.log(`API Request (attempt ${attempt}): ${options.method || 'GET'} ${endpoint}`);

        const response = await fetch(url, requestOptions);

        if (response.status === 401) {
          // Token expired or invalid
          await this.logout();
          throw new Error('Authentication required');
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success === false) {
          throw new Error(data.message || data.error || 'API request failed');
        }

        return data;
      } catch (error) {
        lastError = error as Error;
        console.error(`API request failed (attempt ${attempt}):`, error);

        // Don't retry for authentication errors or client errors
        if (error instanceof Error &&
            (error.message.includes('401') ||
             error.message.includes('400') ||
             error.message.includes('Authentication required'))) {
          break;
        }

        // Wait before retrying
        if (attempt < API_CONFIG.retryAttempts) {
          await new Promise(resolve =>
            setTimeout(resolve, API_CONFIG.retryDelay * attempt)
          );
        }
      }
    }

    throw lastError;
  }

  // Utility Methods
  private decodeJWT(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }

  private isNetworkError(error: any): boolean {
    return error instanceof TypeError ||
           error.message?.includes('fetch') ||
           error.message?.includes('Network');
  }

  // Public getters
  get isAuthenticated(): boolean {
    return !!this.authToken && !!this.userData;
  }

  get currentUser(): any {
    return this.userData;
  }

  get isOnline(): boolean {
    return this.networkStatus.isConnected;
  }

  async getLastSyncTime(): Promise<Date | null> {
    try {
      const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return timestamp ? new Date(timestamp) : null;
    } catch (error) {
      return null;
    }
  }

  async clearCache(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.CACHED_CHURCHES,
      STORAGE_KEYS.CACHED_MEMBERS,
      STORAGE_KEYS.OFFLINE_QUEUE,
    ]);
  }
}

// Export singleton instance
export const enhancedPastoralCareProService = new EnhancedPastoralCareProService();
export default enhancedPastoralCareProService;
