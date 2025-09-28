// PastoralCare Pro API Integration Service
// This service handles communication with the PastoralCare Pro backend

const PASTORAL_CARE_PRO_BASE_URL = process.env.PASTORAL_CARE_PRO_API_URL || 'https://api.pastoralcarepro.com';

export interface PastoralCareProConfig {
  baseUrl: string;
  apiKey?: string;
  organizationId?: string;
  timeout?: number;
}

export interface Church {
  id: string;
  name: string;
  district?: string;
  conference?: string;
  pastor_name?: string;
  pastor_email?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  first_name: string;
  last_name: string;
  church_id: string;
  email?: string;
  phone?: string;
  address?: string;
  affiliation: 'member' | 'visitor' | 'seeker' | 'inactive';
  discipleship_status: 'new' | 'baptized' | 'active' | 'leader' | 'inactive';
  join_date?: string;
  created_at: string;
  updated_at: string;
}

export interface VisitSyncData {
  id: string;
  visit_date: string;
  pastor_email: string;
  pastor_name: string;
  church_id: string;
  member_id?: string;
  member_first?: string;
  member_last?: string;
  visit_type: string;
  category: string;
  comments?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  duration_minutes?: number;
  scripture_refs?: string;
  prayer_requests?: string;
  resources_provided?: string;
  follow_up_date?: string;
  follow_up_actions?: string;
  priority?: string;
  created_at: string;
  updated_at: string;
}

class PastoralCareProService {
  private config: PastoralCareProConfig;

  constructor(config: PastoralCareProConfig) {
    this.config = {
      timeout: 10000,
      ...config
    };
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: AbortSignal.timeout(this.config.timeout!),
      });

      if (!response.ok) {
        throw new Error(`PastoralCare Pro API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PastoralCare Pro API Request Failed:', error);
      throw error;
    }
  }

  // Church Management
  async getChurches(): Promise<Church[]> {
    return this.makeRequest<Church[]>('/api/v1/churches');
  }

  async getChurch(churchId: string): Promise<Church> {
    return this.makeRequest<Church>(`/api/v1/churches/${churchId}`);
  }

  // Member Management
  async getMembers(churchId?: string): Promise<Member[]> {
    const query = churchId ? `?church_id=${churchId}` : '';
    return this.makeRequest<Member[]>(`/api/v1/members${query}`);
  }

  async getMember(memberId: string): Promise<Member> {
    return this.makeRequest<Member>(`/api/v1/members/${memberId}`);
  }

  async searchMembers(query: string, churchId?: string): Promise<Member[]> {
    const params = new URLSearchParams({
      q: query,
      ...(churchId && { church_id: churchId })
    });
    return this.makeRequest<Member[]>(`/api/v1/members/search?${params}`);
  }

  // Visit Sync
  async syncVisit(visitData: VisitSyncData): Promise<{ success: boolean; id: string; message?: string }> {
    return this.makeRequest<{ success: boolean; id: string; message?: string }>('/api/v1/visits', {
      method: 'POST',
      body: JSON.stringify(visitData),
    });
  }

  async syncVisits(visitsData: VisitSyncData[]): Promise<{ success: boolean; synced: number; errors: any[] }> {
    return this.makeRequest<{ success: boolean; synced: number; errors: any[] }>('/api/v1/visits/bulk', {
      method: 'POST',
      body: JSON.stringify({ visits: visitsData }),
    });
  }

  // Statistics and Reports
  async getVisitStats(churchId: string, startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams({
      church_id: churchId,
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate })
    });
    return this.makeRequest(`/api/v1/statistics/visits?${params}`);
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; version: string; timestamp: string }> {
    return this.makeRequest<{ status: string; version: string; timestamp: string }>('/api/v1/health');
  }

  // Authentication (if needed)
  async authenticate(credentials: { email: string; password: string }): Promise<{ token: string; user: any }> {
    return this.makeRequest<{ token: string; user: any }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }
}

// Export singleton instance
export const pastoralCareProService = new PastoralCareProService({
  baseUrl: PASTORAL_CARE_PRO_BASE_URL,
  // API key and organization ID will be configured at runtime
});

// Helper functions for data transformation
export function transformLocalVisitToPastoralCarePro(localVisit: any): VisitSyncData {
  return {
    id: localVisit.id,
    visit_date: new Date(localVisit.visit_date).toISOString(),
    pastor_email: localVisit.pastor_email,
    pastor_name: localVisit.pastor_name,
    church_id: localVisit.church_id,
    member_id: localVisit.member_id,
    member_first: localVisit.member_first,
    member_last: localVisit.member_last,
    visit_type: localVisit.visit_type,
    category: localVisit.category,
    comments: localVisit.comments,
    address: localVisit.address,
    latitude: localVisit.lat,
    longitude: localVisit.lng,
    duration_minutes: localVisit.end_time && localVisit.start_time 
      ? Math.round((localVisit.end_time - localVisit.start_time) / 60000) 
      : undefined,
    scripture_refs: localVisit.scripture_refs,
    prayer_requests: localVisit.prayer_requests,
    resources_provided: localVisit.resources,
    follow_up_date: localVisit.next_visit_date ? new Date(localVisit.next_visit_date).toISOString() : undefined,
    follow_up_actions: localVisit.followup_actions,
    priority: localVisit.priority,
    created_at: new Date(localVisit.updated_at).toISOString(),
    updated_at: new Date(localVisit.updated_at).toISOString(),
  };
}

export default PastoralCareProService;