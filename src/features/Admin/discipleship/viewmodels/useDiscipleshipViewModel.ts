import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../../shared/context/useAuth";
import { useAbortController, isAbortError } from "../../../../shared/viewmodels/useAbortController";
import { getApiErrorMessage } from "../../../../shared/models/api/axiosClient.api";
import { DiscipleshipGroupListApi } from "../models/api/discipleshipGroupList.api";
import { DiscipleshipModuleApi } from "../models/api/discipleshipModule.api";
import { DiscipleshipCalendarApi } from "../models/api/discipleshipCalendar.api";
import { DiscipleshipGroupsApi } from "../models/api/discipleshipGroups.api";
import { DiscipleshipDiscussionApi } from "../models/api/discipleshipDiscussion.api";
import type { DiscipleshipNewGroupFormData } from "../views/components/DiscipleshipModal/DiscipleshipModalNewGroup";
import type { ActiveDiscussionPrompt } from "../views/components/DiscipleshipModal/DiscipleshipModalDiscussionPrompt";
import {
  mapApiGroupToItem,
  extractLeaderFilterOptions,
} from "../models/utils/groupsSchedule.mappers";
import type {
  ApiDisciplerLoad,
  ApiDiscipleshipGroup,
  ApiDisciplerCandidate,
  DiscipleshipGroupItem,
  LeaderFilterOption,
  DiscipleshipTab,
} from "../models/types/groupsScheduleDirectory.types";
import type { ApiDiscipleshipMeeting } from "../models/types/discipleshipCalendar.types";
import { filterDiscipleshipGroups } from "../views/components/DirectoriesFilter/directoriesFilter.utils";
import { formatDateISO } from "../models/utils/discipleshipCalendar.utils";

function parseActiveDiscussionPrompt(raw: unknown): ActiveDiscussionPrompt | null {
  if (!raw) return null;
  if (typeof raw === "string" && raw.trim().length > 0) {
    return {
      id: "server-prompt",
      text: raw.trim(),
      postedAt: "Active",
      status: "ACTIVE",
    };
  }
  if (Array.isArray(raw) && raw.length > 0) {
    return parseActiveDiscussionPrompt(raw[0]);
  }
  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const text =
      (typeof obj.question_text === "string" && obj.question_text) ||
      (typeof obj.text === "string" && obj.text) ||
      (typeof obj.prompt === "string" && obj.prompt) ||
      (typeof obj.question === "string" && obj.question) ||
      "";
    if (text.trim().length > 0) {
      let postedAt = "Active";
      const createdAt =
        typeof obj.created_at === "string"
          ? obj.created_at
          : typeof obj.posted_at === "string"
          ? obj.posted_at
          : undefined;
      if (createdAt) {
        const date = new Date(createdAt);
        if (!isNaN(date.getTime())) {
          const now = new Date();
          const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
          if (diffInMinutes < 1) postedAt = "Posted just now";
          else if (diffInMinutes < 60) postedAt = `Posted ${diffInMinutes}m ago`;
          else {
            const diffInHours = Math.floor(diffInMinutes / 60);
            if (diffInHours < 24) postedAt = `Posted ${diffInHours}h ago`;
            else {
              const diffInDays = Math.floor(diffInHours / 24);
              if (diffInDays < 7) postedAt = `Posted ${diffInDays}d ago`;
              else postedAt = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
            }
          }
        }
      }
      return {
        id: obj.id ? String(obj.id) : obj.question_id ? String(obj.question_id) : "server-prompt",
        text: text.trim(),
        postedAt,
        status: typeof obj.status === "string" ? obj.status.toUpperCase() : "ACTIVE",
      };
    }
  }
  return null;
}

export interface UseDiscipleshipViewModelOptions {
  /** Optional override for churchId; defaults to authenticated user's home_church_id */
  churchId?: string | number;
}

export function useDiscipleshipViewModel(options?: UseDiscipleshipViewModelOptions) {
  const { user } = useAuth();
  const churchId = options?.churchId ?? user?.home_church_id ?? 1;

  const { getSignal } = useAbortController();

  // Tab State
  const [activeTab, setActiveTab] = useState<DiscipleshipTab>("directory");

  // Module toggle state (Admin Journey 9a)
  const [isModuleEnabled, setIsModuleEnabled] = useState(true);
  const [isTogglingModule, setIsTogglingModule] = useState(false);

  // Data fetching states (Admin Journey 13a & 13b)
  const [rawGroups, setRawGroups] = useState<ApiDiscipleshipGroup[]>([]);
  const [disciplerLoad, setDisciplerLoad] = useState<ApiDisciplerLoad[]>([]);
  const [calendarMeetings, setCalendarMeetings] = useState<ApiDiscipleshipMeeting[]>([]);
  const [disciplerCandidates, setDisciplerCandidates] = useState<ApiDisciplerCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Group creation, edit & removal state
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [createGroupError, setCreateGroupError] = useState<string | null>(null);
  const [isUpdatingGroup, setIsUpdatingGroup] = useState(false);
  const [updateGroupError, setUpdateGroupError] = useState<string | null>(null);
  const [isRemovingGroup, setIsRemovingGroup] = useState(false);
  const [removeGroupError, setRemoveGroupError] = useState<string | null>(null);

  // Discussion prompt state
  const [activeDiscussionPrompt, setActiveDiscussionPrompt] =
    useState<ActiveDiscussionPrompt | null>(null);
  const [isPostingPrompt, setIsPostingPrompt] = useState(false);
  const [promptError, setPromptError] = useState<string | null>(null);

  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeaders, setSelectedLeaders] = useState<string[]>([]);

  /**
   * Fetches the church-wide discipleship dashboard, calendar, and discipler candidates from backend
   */
  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const signal = getSignal();

    try {
      const [dashboardResult, calendarResult, candidatesResult] = await Promise.allSettled([
        DiscipleshipGroupListApi.getDiscipleshipDashboard(churchId, signal),
        DiscipleshipCalendarApi.getChurchDiscipleshipCalendar(churchId, signal),
        DiscipleshipGroupsApi.getDisciplerCandidates(churchId, signal),
      ]);

      if (dashboardResult.status === "fulfilled") {
        const data = dashboardResult.value;
        setRawGroups(data.groups ?? []);
        setDisciplerLoad(data.discipler_load ?? []);

        if (typeof data.discipleship_enabled === "boolean") {
          setIsModuleEnabled(data.discipleship_enabled);
        }

        // Check if backend dashboard returns an active discussion prompt
        const anyData = data as unknown as Record<string, unknown>;
        const activePromptData =
          anyData.active_discussion_question ??
          anyData.discussion_question ??
          anyData.active_question ??
          anyData.active_prompt ??
          anyData.question;

        const syncedPrompt = parseActiveDiscussionPrompt(activePromptData);
        if (syncedPrompt) {
          setActiveDiscussionPrompt(syncedPrompt);
        } else {
          // Fallback to standalone endpoint if dashboard does not contain active question
          try {
            const standaloneQuestion = await DiscipleshipDiscussionApi.getDiscussionQuestions(churchId, signal);
            const fallbackPrompt = parseActiveDiscussionPrompt(standaloneQuestion);
            if (fallbackPrompt) {
              setActiveDiscussionPrompt(fallbackPrompt);
            }
          } catch {
            // Non-blocking fallback
          }
        }
      } else if (dashboardResult.reason && !isAbortError(dashboardResult.reason)) {
        const message = getApiErrorMessage(dashboardResult.reason);
        setError(message || "Failed to load discipleship groups.");
      }

      if (calendarResult.status === "fulfilled") {
        setCalendarMeetings(calendarResult.value.meetings ?? []);
      }

      if (candidatesResult.status === "fulfilled") {
        setDisciplerCandidates(candidatesResult.value);
      }
    } catch (err) {
      if (isAbortError(err)) return;
      const message = getApiErrorMessage(err);
      setError(message || "Failed to load discipleship dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, [churchId, getSignal]);


  // Fetch when church context or mount changes
  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  /**
   * Candidate pool derived from /discipler-candidates and discipler_load
   */
  const candidateLeadersPool = useMemo<LeaderFilterOption[]>(() => {
    const leaderMap = new Map<string, LeaderFilterOption>();

    disciplerCandidates.forEach((c) => {
      const anyCandidate = c as Record<string, unknown>;
      const id = c.uid || c.user_id || c.id || anyCandidate.profile_id;
      const name = c.name || [c.first_name, c.last_name].filter(Boolean).join(" ");
      const imageUrl =
        c.profile_picture_url ||
        (typeof anyCandidate.avatar_url === "string" ? anyCandidate.avatar_url : undefined) ||
        (typeof anyCandidate.image_url === "string" ? anyCandidate.image_url : undefined) ||
        undefined;

      if (id && name) {
        leaderMap.set(String(id), {
          id: String(id),
          name: name.trim(),
          imageUrl,
        });
      }
    });

    disciplerLoad.forEach((load) => {
      if (load.discipler_user_id && load.name && !leaderMap.has(String(load.discipler_user_id))) {
        leaderMap.set(String(load.discipler_user_id), {
          id: String(load.discipler_user_id),
          name: load.name.trim(),
          imageUrl: load.image_url,
        });
      }
    });

    return Array.from(leaderMap.values());
  }, [disciplerCandidates, disciplerLoad]);

  /**
   * Transforms raw API groups into UI model items, resolving leader names against candidate pool
   */
  const groups = useMemo<DiscipleshipGroupItem[]>(() => {
    return rawGroups.map((g) => mapApiGroupToItem(g, candidateLeadersPool));
  }, [rawGroups, candidateLeadersPool]);

  /**
   * Dynamically extracts leader options from real API data
   */
  const availableLeaders = useMemo<LeaderFilterOption[]>(() => {
    return extractLeaderFilterOptions(rawGroups, disciplerLoad, candidateLeadersPool);
  }, [rawGroups, disciplerLoad, candidateLeadersPool]);

  /**
   * Candidate leaders for group assignment: merges eligible candidates from
   * /discipler-candidates with existing group leaders.
   */
  const candidateLeaders = useMemo<LeaderFilterOption[]>(() => {
    const leaderMap = new Map<string, LeaderFilterOption>();

    candidateLeadersPool.forEach((c) => {
      leaderMap.set(String(c.id), c);
    });

    availableLeaders.forEach((l) => {
      if (!leaderMap.has(String(l.id))) {
        leaderMap.set(String(l.id), l);
      }
    });

    return Array.from(leaderMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
  }, [candidateLeadersPool, availableLeaders]);

  /**
   * Real-time filtered groups based on search text and selected leaders
   */
  const filteredGroups = useMemo<DiscipleshipGroupItem[]>(() => {
    return filterDiscipleshipGroups(groups, searchQuery, selectedLeaders);
  }, [groups, searchQuery, selectedLeaders]);

  /**
   * [FEATURE ON HOLD / UNDER DECISION]
   * Handles toggle switch change for "Active on mobile".
   * Endpoint: PATCH /api/churches/:churchId/modules with { discipleship_enabled: boolean }
   * Currently on hold while the UI toggle is hidden.
   */
  const handleToggleModule = useCallback(
    async (nextValue: boolean) => {
      if (isTogglingModule) return;
      const previousValue = isModuleEnabled;
      setIsModuleEnabled(nextValue);
      setIsTogglingModule(true);

      try {
        await DiscipleshipModuleApi.toggleDiscipleshipModule(churchId, {
          discipleship_enabled: nextValue,
        });
      } catch (err) {
        // Rollback state on failure
        setIsModuleEnabled(previousValue);
        const message = getApiErrorMessage(err);
        setError(message || "Failed to update Discipleship module status.");
      } finally {
        setIsTogglingModule(false);
      }
    },
    [churchId, isModuleEnabled, isTogglingModule],
  );

  const handleLeaderToggle = useCallback((name: string) => {
    setSelectedLeaders((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  }, []);

  const handleClearLeaders = useCallback(() => {
    setSelectedLeaders([]);
  }, []);

  // Compute number of scheduled sessions for today
  const todayScheduleCount = useMemo(() => {
    const todayISO = formatDateISO(new Date());
    return calendarMeetings.filter((m) => {
      const mDate = m.meeting_date ?? "";
      return mDate === todayISO;
    }).length;
  }, [calendarMeetings]);

  /**
   * Creates a new discipleship group and assigns the designated discipler
   */
  const handleCreateGroup = useCallback(
    async (formData: DiscipleshipNewGroupFormData): Promise<boolean> => {
      if (isCreatingGroup) return false;
      setIsCreatingGroup(true);
      setCreateGroupError(null);

      try {
        // 1. Create discipleship group: POST /api/discipleships
        const createRes = await DiscipleshipGroupsApi.createGroup({
          church_id: churchId,
          name: formData.name.trim(),
          capacity_limit: formData.maxCapacity > 0 ? formData.maxCapacity : undefined,
        });

        const newGroupId = createRes.discipleship_id || createRes.id;

        // 2. If a discipler is selected, assign them: POST /api/discipleships/:id/disciplers
        if (newGroupId && formData.disciplerId) {
          try {
            await DiscipleshipGroupsApi.assignDiscipler(newGroupId, {
              user_id: formData.disciplerId,
              role: "leader",
            });
          } catch (assignErr) {
            console.error("Group created but leader assignment failed:", assignErr);
          }
        }

        // 3. Auto-refresh dashboard & directory
        await fetchDashboard();
        return true;
      } catch (err) {
        const message = getApiErrorMessage(err);
        setCreateGroupError(message || "Failed to create discipleship group.");
        return false;
      } finally {
        setIsCreatingGroup(false);
      }
    },
    [churchId, fetchDashboard, isCreatingGroup],
  );

  /**
   * Updates an existing discipleship group and reassigns/updates discipler
   */
  const handleUpdateGroup = useCallback(
    async (
      groupId: string,
      formData: DiscipleshipNewGroupFormData,
      currentLeaderId?: string,
    ): Promise<boolean> => {
      if (isUpdatingGroup) return false;
      setIsUpdatingGroup(true);
      setUpdateGroupError(null);

      try {
        // 1. Update group details (name, capacity limit)
        await DiscipleshipGroupsApi.updateGroup(groupId, {
          name: formData.name.trim(),
          capacity_limit: formData.maxCapacity > 0 ? formData.maxCapacity : undefined,
        });

        // 2. Only modify leader if a leader is selected AND it is different from the current leader
        const isLeaderChanged =
          formData.disciplerId &&
          formData.disciplerId.trim() !== (currentLeaderId || "").trim();

        if (isLeaderChanged) {
          if (currentLeaderId) {
            // Group already had a leader: execute leadership handoff
            try {
              await DiscipleshipGroupsApi.executeLeadershipHandoff({
                discipleship_id: groupId,
                outgoing_user_id: currentLeaderId,
                incoming_user_id: formData.disciplerId,
              });
            } catch (handoffErr) {
              console.error("Leadership handoff failed, falling back to assign:", handoffErr);
              await DiscipleshipGroupsApi.assignDiscipler(groupId, {
                user_id: formData.disciplerId,
                role: "leader",
              });
            }
          } else {
            // Group had no leader (initial assignment)
            await DiscipleshipGroupsApi.assignDiscipler(groupId, {
              user_id: formData.disciplerId,
              role: "leader",
            });
          }
        }

        await fetchDashboard();
        return true;
      } catch (err) {
        const message = getApiErrorMessage(err);
        setUpdateGroupError(message || "Failed to update discipleship group.");
        return false;
      } finally {
        setIsUpdatingGroup(false);
      }
    },
    [fetchDashboard, isUpdatingGroup],
  );

  /**
   * Archives/removes an existing discipleship group
   */
  const handleRemoveGroup = useCallback(
    async (groupId: string): Promise<boolean> => {
      if (isRemovingGroup) return false;
      setIsRemovingGroup(true);
      setRemoveGroupError(null);

      try {
        await DiscipleshipGroupsApi.updateGroup(groupId, {
          status: "archived",
        });

        await fetchDashboard();
        return true;
      } catch (err) {
        const message = getApiErrorMessage(err);
        setRemoveGroupError(message || "Failed to remove discipleship group.");
        return false;
      } finally {
        setIsRemovingGroup(false);
      }
    },
    [fetchDashboard, isRemovingGroup],
  );

  /**
   * Posts a new church-wide discussion prompt to backend: POST /api/discipleship-discussion-questions
   */
  const handlePostDiscussionPrompt = useCallback(
    async (promptText: string): Promise<boolean> => {
      if (isPostingPrompt) return false;
      setIsPostingPrompt(true);
      setPromptError(null);

      try {
        const res = await DiscipleshipDiscussionApi.postDiscussionQuestion({
          church_id: churchId,
          question_text: promptText.trim(),
        });

        const formatted =
          promptText.startsWith("“") || promptText.startsWith('"')
            ? promptText
            : `“${promptText}”`;

        const newPrompt: ActiveDiscussionPrompt = {
          id: res.question_id || res.id || Date.now().toString(),
          text: res.question_text || formatted,
          postedAt: "Posted just now",
          status: "ACTIVE",
        };

        setActiveDiscussionPrompt(newPrompt);
        void fetchDashboard();
        return true;
      } catch (err) {
        const message = getApiErrorMessage(err);
        setPromptError(message || "Failed to post discussion prompt.");
        return false;
      } finally {
        setIsPostingPrompt(false);
      }
    },
    [churchId, fetchDashboard, isPostingPrompt],
  );

  return {
    churchId,

    // Tab state
    tab: {
      active: activeTab,
      onChange: setActiveTab,
      todayScheduleCount,
    },

    // Module toggle
    module: {
      isEnabled: isModuleEnabled,
      isToggling: isTogglingModule,
      onToggle: handleToggleModule,
    },

    // Groups data
    groups,
    filteredGroups,

    // Group Creation & Candidates
    groupCreation: {
      candidates: candidateLeaders,
      isCreating: isCreatingGroup,
      error: createGroupError,
      onCreateGroup: handleCreateGroup,
      clearError: () => setCreateGroupError(null),
    },

    // Group Management (Create, Edit, Remove)
    groupManagement: {
      candidates: candidateLeaders,
      isCreating: isCreatingGroup,
      createError: createGroupError,
      onCreateGroup: handleCreateGroup,
      isUpdating: isUpdatingGroup,
      updateError: updateGroupError,
      onUpdateGroup: handleUpdateGroup,
      isRemoving: isRemovingGroup,
      removeError: removeGroupError,
      onRemoveGroup: handleRemoveGroup,
      clearErrors: () => {
        setCreateGroupError(null);
        setUpdateGroupError(null);
        setRemoveGroupError(null);
      },
    },

    // Discussion Prompts
    discussionPrompt: {
      activePrompt: activeDiscussionPrompt,
      isPosting: isPostingPrompt,
      error: promptError,
      onPostPrompt: handlePostDiscussionPrompt,
      clearError: () => setPromptError(null),
    },

    // Filter controls
    filter: {
      searchQuery,
      onSearchChange: setSearchQuery,
      leaders: availableLeaders,
      selectedLeaders,
      onLeaderToggle: handleLeaderToggle,
      onClearLeaders: handleClearLeaders,
    },

    // Network status
    status: {
      isLoading,
      error,
      onRetry: fetchDashboard,
    },
  };
}

export default useDiscipleshipViewModel;

