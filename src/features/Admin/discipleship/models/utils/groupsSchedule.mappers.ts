import type {
  ApiDiscipleshipGroup,
  ApiDisciplerLoad,
  DiscipleshipGroupItem,
  LeaderFilterOption,
} from "../types/groupsScheduleDirectory.types";

/**
 * Resolves leader name, image URL, and ID from multiple possible API shapes
 * or falls back to candidate leaders lookup by ID.
 */
export function resolveLeaderInfo(
  group: ApiDiscipleshipGroup,
  candidates?: readonly LeaderFilterOption[],
): {
  leaderName: string;
  leaderImageUrl?: string;
  leaderId?: string;
} {
  const anyGroup = group as Record<string, unknown>;

  // 1. Check all leader/discipler object variants
  const leaderObj =
    (Array.isArray(anyGroup.leaders) && anyGroup.leaders[0]) ||
    (Array.isArray(anyGroup.disciplers) && anyGroup.disciplers[0]) ||
    (typeof anyGroup.leader === "object" && anyGroup.leader) ||
    (typeof anyGroup.discipler === "object" && anyGroup.discipler) ||
    (typeof anyGroup.assigned_leader === "object" && anyGroup.assigned_leader) ||
    (typeof anyGroup.assigned_discipler === "object" && anyGroup.assigned_discipler);

  const leaderObjRecord =
    (typeof leaderObj === "object" && leaderObj !== null ? leaderObj : {}) as Record<string, unknown>;

  // 2. Identify leader ID from any possible field
  const leaderId =
    leaderObjRecord.id ||
    leaderObjRecord.uid ||
    leaderObjRecord.user_id ||
    leaderObjRecord.userId ||
    (typeof leaderObjRecord.user === "object" &&
      leaderObjRecord.user !== null &&
      ((leaderObjRecord.user as Record<string, unknown>).id ||
        (leaderObjRecord.user as Record<string, unknown>).uid)) ||
    anyGroup.leader_id ||
    anyGroup.leaderId ||
    anyGroup.discipler_id ||
    anyGroup.disciplerId ||
    anyGroup.discipler_user_id ||
    (Array.isArray(anyGroup.leader_user_ids) && anyGroup.leader_user_ids[0]) ||
    (Array.isArray(anyGroup.discipler_user_ids) && anyGroup.discipler_user_ids[0]) ||
    anyGroup.created_by;

  // 3. Extract direct leader name strings
  let leaderName =
    (typeof anyGroup.leader_name === "string" && anyGroup.leader_name) ||
    (typeof anyGroup.discipler_name === "string" && anyGroup.discipler_name) ||
    (typeof anyGroup.leader_full_name === "string" && anyGroup.leader_full_name) ||
    (typeof anyGroup.discipler_full_name === "string" && anyGroup.discipler_full_name) ||
    "";

  // 4. Extract name from leaderObj
  if (!leaderName && leaderObj) {
    if (typeof leaderObj === "string") {
      leaderName = leaderObj;
    } else {
      const first = (leaderObjRecord.first_name || leaderObjRecord.firstName || "") as string;
      const last = (leaderObjRecord.last_name || leaderObjRecord.lastName || "") as string;
      const combined = [first, last].filter(Boolean).join(" ");

      const userFirst =
        (typeof leaderObjRecord.user === "object" &&
        leaderObjRecord.user !== null
          ? ((leaderObjRecord.user as Record<string, unknown>).first_name ||
              (leaderObjRecord.user as Record<string, unknown>).firstName ||
              "")
          : "") as string;
      const userLast =
        (typeof leaderObjRecord.user === "object" &&
        leaderObjRecord.user !== null
          ? ((leaderObjRecord.user as Record<string, unknown>).last_name ||
              (leaderObjRecord.user as Record<string, unknown>).lastName ||
              "")
          : "") as string;
      const userCombined = [userFirst, userLast].filter(Boolean).join(" ");

      leaderName =
        (typeof leaderObjRecord.name === "string" && leaderObjRecord.name) ||
        (typeof leaderObjRecord.full_name === "string" && leaderObjRecord.full_name) ||
        (typeof leaderObjRecord.fullName === "string" && leaderObjRecord.fullName) ||
        (typeof leaderObjRecord.displayName === "string" && leaderObjRecord.displayName) ||
        (typeof leaderObjRecord.display_name === "string" && leaderObjRecord.display_name) ||
        combined ||
        (typeof leaderObjRecord.user === "object" &&
          leaderObjRecord.user !== null &&
          typeof (leaderObjRecord.user as Record<string, unknown>).name === "string" &&
          ((leaderObjRecord.user as Record<string, unknown>).name as string)) ||
        userCombined ||
        "";
    }
  }

  // 5. Extract image url
  let leaderImageUrl: string | undefined =
    (typeof anyGroup.leader_image_url === "string" && anyGroup.leader_image_url) ||
    (typeof anyGroup.discipler_image_url === "string" && anyGroup.discipler_image_url) ||
    (typeof leaderObjRecord.image_url === "string" && leaderObjRecord.image_url) ||
    (typeof leaderObjRecord.profile_picture_url === "string" && leaderObjRecord.profile_picture_url) ||
    (typeof leaderObjRecord.avatar_url === "string" && leaderObjRecord.avatar_url) ||
    (typeof leaderObjRecord.imageUrl === "string" && leaderObjRecord.imageUrl) ||
    undefined;

  // 6. Fallback: match via candidate leaders pool by leaderId
  if ((!leaderName || leaderName === "Unassigned Leader") && leaderId && candidates?.length) {
    const matched = candidates.find(
      (c) => String(c.id).toLowerCase() === String(leaderId).toLowerCase(),
    );
    if (matched) {
      leaderName = matched.name;
      if (!leaderImageUrl) leaderImageUrl = matched.imageUrl;
    }
  }

  return {
    leaderName: leaderName.trim() ? leaderName.trim() : "Unassigned Leader",
    leaderImageUrl,
    leaderId: leaderId ? String(leaderId) : undefined,
  };
}

/**
 * Maps raw backend API group to client-facing DiscipleshipGroupItem model
 */
export function mapApiGroupToItem(
  group: ApiDiscipleshipGroup,
  candidateLeaders?: readonly LeaderFilterOption[],
): DiscipleshipGroupItem {
  const currentSeats = group.active_member_count ?? group.current_seats ?? 0;
  const maxSeats = group.capacity_limit ?? group.max_seats ?? 10;

  const { leaderName, leaderImageUrl, leaderId } = resolveLeaderInfo(
    group,
    candidateLeaders,
  );

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
 * Extracts unique LeaderFilterOptions from groups, discipler load, or candidates
 */
export function extractLeaderFilterOptions(
  groups: ApiDiscipleshipGroup[],
  disciplerLoad?: ApiDisciplerLoad[],
  candidates?: readonly LeaderFilterOption[],
): LeaderFilterOption[] {
  const leaderMap = new Map<string, LeaderFilterOption>();

  // 1. From candidate leaders
  candidates?.forEach((c) => {
    if (c.name && !leaderMap.has(c.name)) {
      leaderMap.set(c.name, c);
    }
  });

  // 2. From discipler_load overview
  disciplerLoad?.forEach((load) => {
    if (load.name && !leaderMap.has(load.name)) {
      leaderMap.set(load.name, {
        id: load.discipler_user_id,
        name: load.name,
        imageUrl: load.image_url,
      });
    }
  });

  // 3. From groups leaders
  groups.forEach((group) => {
    const { leaderName, leaderImageUrl, leaderId } = resolveLeaderInfo(
      group,
      candidates,
    );
    if (
      leaderName &&
      leaderName !== "Unassigned Leader" &&
      !leaderMap.has(leaderName)
    ) {
      leaderMap.set(leaderName, {
        id: leaderId || leaderName,
        name: leaderName,
        imageUrl: leaderImageUrl,
      });
    }
  });

  return Array.from(leaderMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}
