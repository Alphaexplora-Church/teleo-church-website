/**
 * Discipleship Directory Domain & API Types
 * Strictly pure types - no UI component dependencies or runtime helper functions.
 */

export type DiscipleshipTab = "directory" | "calendar";

export interface LeaderFilterOption {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface DiscipleshipGroupItem {
  id: string | number;
  title: string;
  leaderName: string;
  leaderImageUrl?: string;
  currentSeats: number;
  maxSeats: number;
  isFull?: boolean;
}

/**
 * Raw discipleship group contract returned by GET /api/churches/:churchId/discipleship-dashboard
 * Aligned with v_discipleship_group_directory view and API schema
 */
export interface ApiDiscipleshipGroup {
  id?: string;
  discipleship_id?: string;
  church_id?: number | string;
  name?: string;
  discipleship_name?: string;
  title?: string;
  capacity_limit?: number | null;
  max_seats?: number | null;
  active_member_count?: number;
  current_seats?: number;
  leader_user_ids?: string[];
  leader_name?: string | null;
  leader_image_url?: string | null;
  leaders?: Array<{
    id: string;
    name: string;
    image_url?: string;
    role?: string;
  }>;
  next_meeting_time?: string | null;
  status?: "active" | "inactive" | "archived" | string;
}

/**
 * Discipler load contract from GET /api/churches/:churchId/discipleship-dashboard
 * Aligned with v_discipler_load view
 */
export interface ApiDisciplerLoad {
  discipler_user_id: string;
  church_id?: number | string;
  name?: string;
  image_url?: string;
  groups_led_count: number;
  total_disciples_count: number;
}

/**
 * Full response structure for GET /api/churches/:churchId/discipleship-dashboard (Journey 13a)
 */
export interface DiscipleshipDashboardResponse {
  groups: ApiDiscipleshipGroup[];
  discipler_load?: ApiDisciplerLoad[];
  discipleship_enabled?: boolean;
}

/**
 * Payload for PATCH /api/churches/:churchId/modules (Journey 9a)
 */
export interface ToggleDiscipleshipModulePayload {
  discipleship_enabled: boolean;
}

/**
 * Response for PATCH /api/churches/:churchId/modules (Journey 9a)
 */
export interface ToggleDiscipleshipModuleResponse {
  discipleship_enabled: boolean;
  message?: string;
}
