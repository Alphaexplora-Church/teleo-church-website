import type { DiscipleshipGroupItem } from "../../components/DiscipleshipCardList/DiscipleshipGroupCardList";
import type { LeaderFilterOption } from "../../components/DirectoriesFilter/DirectoriesFilter";
import type { DiscipleshipTab } from "../../components/DiscipleshipTabSwitch/DiscipleshipTabSwitch";

/**
 * Raw discipleship group contract returned by GET /churches/:churchId/discipleship-dashboard
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
 * Discipler load contract from GET /churches/:churchId/discipleship-dashboard
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
 * Full response structure for GET /churches/:churchId/discipleship-dashboard (Journey 13a)
 */
export interface DiscipleshipDashboardResponse {
  groups: ApiDiscipleshipGroup[];
  discipler_load?: ApiDisciplerLoad[];
  discipleship_enabled?: boolean;
}

/**
 * Payload for PATCH /churches/:churchId/modules (Journey 9a)
 */
export interface ToggleDiscipleshipModulePayload {
  discipleship_enabled: boolean;
}

/**
 * Response for PATCH /churches/:churchId/modules (Journey 9a)
 */
export interface ToggleDiscipleshipModuleResponse {
  discipleship_enabled: boolean;
  message?: string;
}

/**
 * Maps raw backend API group to client-facing DiscipleshipGroupItem model
 */
export function mapApiGroupToItem(
  group: ApiDiscipleshipGroup,
): DiscipleshipGroupItem {
  const id = group.discipleship_id || group.id || String(Math.random());
  const title =
    group.discipleship_name ||
    group.name ||
    group.title ||
    "Untitled Group";
  const leaderName =
    group.leader_name ||
    group.leaders?.[0]?.name ||
    "Unassigned Leader";
  const leaderImageUrl =
    group.leader_image_url || group.leaders?.[0]?.image_url;
  const currentSeats =
    group.active_member_count ?? group.current_seats ?? 0;
  const maxSeats = group.capacity_limit ?? group.max_seats ?? 10;
  const isFull = maxSeats > 0 ? currentSeats >= maxSeats : false;

  return {
    id,
    title,
    leaderName,
    leaderImageUrl,
    currentSeats,
    maxSeats,
    isFull,
  };
}

/**
 * Extracts unique LeaderFilterOptions from groups or discipler load data
 */
export function extractLeaderFilterOptions(
  groups: ApiDiscipleshipGroup[],
  disciplerLoad?: ApiDisciplerLoad[],
): LeaderFilterOption[] {
  const leaderMap = new Map<string, LeaderFilterOption>();

  // 1. If discipler_load was provided with names
  if (disciplerLoad) {
    for (const load of disciplerLoad) {
      if (load.name && !leaderMap.has(load.name)) {
        leaderMap.set(load.name, {
          id: load.discipler_user_id,
          name: load.name,
          imageUrl: load.image_url,
        });
      }
    }
  }

  // 2. From groups leaders / leaderName
  for (const group of groups) {
    if (group.leaders && group.leaders.length > 0) {
      for (const leader of group.leaders) {
        if (leader.name && !leaderMap.has(leader.name)) {
          leaderMap.set(leader.name, {
            id: leader.id,
            name: leader.name,
            imageUrl: leader.image_url,
          });
        }
      }
    } else if (group.leader_name && !leaderMap.has(group.leader_name)) {
      leaderMap.set(group.leader_name, {
        id: group.leader_user_ids?.[0] || group.leader_name,
        name: group.leader_name,
        imageUrl: group.leader_image_url || undefined,
      });
    }
  }

  return Array.from(leaderMap.values());
}

export type { DiscipleshipGroupItem, LeaderFilterOption, DiscipleshipTab };
