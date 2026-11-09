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

  const firstLeader = group.leaders?.[0];
  const leaderId = firstLeader?.id || firstLeader?.uid || group.leader_user_ids?.[0];
  const firstLeaderFullName =
    firstLeader?.name ||
    [firstLeader?.first_name, firstLeader?.last_name].filter(Boolean).join(" ");

  const leaderName =
    group.leader_name ||
    (firstLeaderFullName.trim() ? firstLeaderFullName.trim() : "Unassigned Leader");

  const leaderImageUrl =
    group.leader_image_url || firstLeader?.image_url;

  return {
    id: group.discipleship_id ?? group.id ?? "",
    title: group.discipleship_name ?? group.name ?? group.title ?? "Untitled Group",
    leaderName,
    leaderImageUrl,
    leaderId,
    currentSeats,
    maxSeats,
    isFull: group.is_full ?? (maxSeats > 0 ? currentSeats >= maxSeats : false),
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
        const leaderFullName =
          leader.name ||
          [leader.first_name, leader.last_name].filter(Boolean).join(" ");
        const cleanName = leaderFullName.trim();
        const leaderId = leader.id || leader.uid || cleanName;

        if (cleanName && leaderId && !leaderMap.has(cleanName)) {
          leaderMap.set(cleanName, {
            id: leaderId,
            name: cleanName,
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
