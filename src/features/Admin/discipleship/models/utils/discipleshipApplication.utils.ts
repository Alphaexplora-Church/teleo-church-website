import type { PlacementGroup } from "../types/discipleshipApplication.types";
import type { ApiDiscipleshipGroup } from "../types/groupsScheduleDirectory.types";

/**
 * Computes the group with the lowest remaining seats that still has capacity.
 * If all groups are full or none are available, returns an empty string.
 */
export function getLowestRemainingCapacityGroupId(groups: PlacementGroup[]): string {
  const availableGroups = groups.filter((g) => g.currentSeats < g.maxSeats);
  if (availableGroups.length === 0) {
    return "";
  }
  const sorted = [...availableGroups].sort(
    (a, b) => a.maxSeats - a.currentSeats - (b.maxSeats - b.currentSeats),
  );
  return sorted[0].id;
}

/**
 * Maps a raw API discipleship group object to the placement group contract.
 */
export function mapApiGroupToPlacementGroup(group: ApiDiscipleshipGroup): PlacementGroup {
  return {
    id: String(group.id ?? group.discipleship_id ?? ""),
    name: group.name ?? group.discipleship_name ?? group.title ?? "Discipleship Group",
    currentSeats: group.current_seats ?? group.active_member_count ?? 0,
    maxSeats: group.max_seats ?? group.capacity_limit ?? 10,
    leaderName: group.leader_name ?? undefined,
  };
}
