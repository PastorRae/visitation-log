export type UUID = string;

export type VisitType =
  | "in_person"
  | "phone"
  | "video"
  | "emergency"
  | "hospital"
  | "home"
  | "office";

export type VisitCategory =
  | "pastoral"
  | "crisis"
  | "discipleship"
  | "administrative"
  | "evangelism"
  | "conflict"
  | "celebration"
  | "bereavement";

export type Priority = "critical" | "important" | "standard" | "routine" | "annual";

export interface VisitRecord {
  id: UUID;
  start_time?: number;
  end_time?: number;
  visit_date: number;
  pastor_email: string;
  pastor_name: string;
  member_id?: UUID;
  member_first?: string;
  member_last?: string;
  church_id?: string;
  visit_type: VisitType;
  category: VisitCategory;
  comments?: string;
  address?: string;
  lat?: number | null;
  lng?: number | null;
  next_visit_date?: number | null;
  followup_actions?: string | null;
  priority?: Priority | null;
  scripture_refs?: string | null;
  prayer_requests?: string | null;
  resources?: string | null;
  synced: 0 | 1;
  updated_at: number;
}

export interface Followup {
  id: UUID;
  visit_id: UUID;
  due_date: number;
  actions: string;
  priority: Priority;
  status: "open" | "done" | "overdue";
  synced: 0 | 1;
  updated_at: number;
}

export interface Member {
  id: UUID;
  first_name: string;
  last_name: string;
  church_id: string;
  affiliation?: string;
  discipleship_status?: string;
}

export interface Church {
  id: UUID;
  name: string;
}

export interface ChurchProfile {
  id: UUID;
  name: string;
  pastor_name: string;
  pastor_email: string;
  community_service_hours_target: number;
  small_groups_target: number;
  digital_evangelism_reach_target: number;
}

export interface KpiDashboard {
  id: UUID;
  church_id: UUID;
  community_service_hours: number;
  small_groups_per_church: number;
  digital_evangelism_reach: number;
  updated_at: number;
}

export interface VisitLog {
  id: UUID;
  visit_id: UUID;
  activity_metadata: {
    church_id: UUID;
    event_type: string;
    timestamp: number;
  };
  notes: string;
  metrics: {
    patients_screened?: number;
    small_groups_identified?: number;
  };
}

export const CHURCH_IDS = {
  MAIN: "slc-bb-main",
  ALT: "slc-bb-alt"
} as const;

export type ChurchId = typeof CHURCH_IDS[keyof typeof CHURCH_IDS];
