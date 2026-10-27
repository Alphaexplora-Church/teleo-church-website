import type {
  ApiDiscipleshipGroup,
  ApiDisciplerLoad,
  DiscipleshipGroupItem,
  LeaderFilterOption,
} from "../types/groupsScheduleDirectory.types";

/**
 * Maps raw backend API group to client-facing DiscipleshipGroupItem model
 */
export function mapApiGroupToItem(
  group: ApiDiscipleshipGroup,
): DiscipleshipGroupItem {
  const currentSeats = group.active_member_count ?? group.current_seats ?? 0;
  const maxSeats = group.capacity_limit ?? group.max_seats ?? 10;

  return {
    id: group.discipleship_id ?? group.id ?? "",
    title: group.discipleship_name ?? group.name ?? group.title ?? "Untitled Group",
    leaderName: group.leader_name ?? group.leaders?.[0]?.name ?? "Unassigned Leader",
    leaderImageUrl: group.leader_image_url ?? group.leaders?.[0]?.image_url,
    currentSeats,
    maxSeats,
    isFull: maxSeats > 0 ? currentSeats >= maxSeats : false,
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

  // 1. From discipler_load overview
  disciplerLoad?.forEach((load) => {
    if (load.name && !leaderMap.has(load.name)) {
      leaderMap.set(load.name, {
        id: load.discipler_user_id,
        name: load.name,
        imageUrl: load.image_url,
      });
    }
  });

  // 2. From groups leaders
  groups.forEach((group) => {
    if (group.leaders?.length) {
      group.leaders.forEach((leader) => {
        if (leader.name && !leaderMap.has(leader.name)) {
          leaderMap.set(leader.name, {
            id: leader.id,
            name: leader.name,
            imageUrl: leader.image_url,
          });
        }
      });
    } else if (group.leader_name && !leaderMap.has(group.leader_name)) {
      leaderMap.set(group.leader_name, {
        id: group.leader_user_ids?.[0] || group.leader_name,
        name: group.leader_name,
        imageUrl: group.leader_image_url || undefined,
      });
    }
  });

  return Array.from(leaderMap.values());
}
