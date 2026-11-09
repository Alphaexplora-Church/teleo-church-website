import type {
  ApplicantAnswer,
  DiscipleshipApplicant,
  PlacementGroup,
  ApiDiscipleshipApplication,
} from "../types/discipleshipApplication.types";
import type { ApiDiscipleshipGroup } from "../types/groupsScheduleDirectory.types";

/**
 * Formats an ISO date into a human readable relative time (e.g. "Applied 2 days ago")
 */
export function formatAppliedRelativeTime(isoDate?: string): string {
  if (!isoDate) return "Applied recently";
  try {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    if (isNaN(diffMs) || diffMs < 0) return "Applied recently";
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Applied just now";
    if (diffHours < 24) return `Applied ${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Applied yesterday";
    return `Applied ${diffDays} days ago`;
  } catch {
    return "Applied recently";
  }
}

/**
 * Maps a raw ApiDiscipleshipApplication to DiscipleshipApplicant domain model
 */
export function mapApiApplicationToApplicant(
  apiApp: ApiDiscipleshipApplication,
): DiscipleshipApplicant {
  const applicantName =
    apiApp.applicant?.name ||
    [apiApp.applicant?.first_name, apiApp.applicant?.last_name].filter(Boolean).join(" ") ||
    "Applicant";

  const answers: ApplicantAnswer[] = [];
  if (apiApp.form_response && typeof apiApp.form_response === "object") {
    Object.entries(apiApp.form_response).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        answers.push({
          questionId: key,
          questionText: `Question ${key.replace(/^q/i, "")}`,
          answerText: String(value),
        });
      }
    });
  }

  const rawStatus = (apiApp.status || "pending").toUpperCase();
  const status: "PENDING" | "APPROVED" | "REJECTED" =
    rawStatus === "APPROVED"
      ? "APPROVED"
      : rawStatus === "REJECTED"
        ? "REJECTED"
        : "PENDING";

  return {
    id: String(apiApp.id),
    name: applicantName,
    email: apiApp.applicant?.email,
    avatarUrl: apiApp.applicant?.profile_picture_url || undefined,
    isHomeChurch: Boolean(apiApp.is_home_church),
    appliedRelativeTime: formatAppliedRelativeTime(apiApp.created_at),
    answers,
    status,
    assignedGroupId: apiApp.assigned_discipleship_id || undefined,
  };
}

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
  const firstLeader = group.leaders?.[0];
  const firstLeaderFullName =
    firstLeader?.name ||
    [firstLeader?.first_name, firstLeader?.last_name].filter(Boolean).join(" ");

  const leaderName =
    group.leader_name ||
    (firstLeaderFullName.trim() ? firstLeaderFullName.trim() : undefined);

  return {
    id: String(group.id ?? group.discipleship_id ?? ""),
    name: group.name ?? group.discipleship_name ?? group.title ?? "Discipleship Group",
    currentSeats: group.current_seats ?? group.active_member_count ?? 0,
    maxSeats: group.max_seats ?? group.capacity_limit ?? 10,
    leaderName,
  };
}
