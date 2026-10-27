import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../../shared/context/useAuth";
import { useAbortController, isAbortError } from "../../../../shared/viewmodels/useAbortController";
import { getApiErrorMessage } from "../../../../shared/models/api/axiosClient.api";
import { DiscipleshipGroupListApi } from "../models/api/discipleshipGroupList.api";
import { DiscipleshipModuleApi } from "../models/api/discipleshipModule.api";
import {
  mapApiGroupToItem,
  extractLeaderFilterOptions,
} from "../models/utils/groupsSchedule.mappers";
import type {
  ApiDisciplerLoad,
  ApiDiscipleshipGroup,
  DiscipleshipGroupItem,
  LeaderFilterOption,
  DiscipleshipTab,
} from "../models/types/groupsScheduleDirectory.types";
import { filterDiscipleshipGroups } from "../components/DirectoriesFilter/directoriesFilter.utils";

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

  // Data fetching states (Admin Journey 13a)
  const [rawGroups, setRawGroups] = useState<ApiDiscipleshipGroup[]>([]);
  const [disciplerLoad, setDisciplerLoad] = useState<ApiDisciplerLoad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeaders, setSelectedLeaders] = useState<string[]>([]);

  /**
   * Fetches the church-wide discipleship dashboard from backend
   */
  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const signal = getSignal();

    try {
      const data = await DiscipleshipGroupListApi.getDiscipleshipDashboard(
        churchId,
        signal,
      );

      setRawGroups(data.groups ?? []);
      setDisciplerLoad(data.discipler_load ?? []);

      if (typeof data.discipleship_enabled === "boolean") {
        setIsModuleEnabled(data.discipleship_enabled);
      }
    } catch (err) {
      if (isAbortError(err)) return;
      const message = getApiErrorMessage(err);
      setError(message || "Failed to load discipleship groups. Make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  }, [churchId, getSignal]);

  // Fetch when church context or mount changes
  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  /**
   * Transforms raw API groups into UI model items
   */
  const groups = useMemo<DiscipleshipGroupItem[]>(() => {
    return rawGroups.map(mapApiGroupToItem);
  }, [rawGroups]);

  /**
   * Dynamically extracts leader options from real API data
   */
  const availableLeaders = useMemo<LeaderFilterOption[]>(() => {
    return extractLeaderFilterOptions(rawGroups, disciplerLoad);
  }, [rawGroups, disciplerLoad]);

  /**
   * Real-time filtered groups based on search text and selected leaders
   */
  const filteredGroups = useMemo<DiscipleshipGroupItem[]>(() => {
    return filterDiscipleshipGroups(groups, searchQuery, selectedLeaders);
  }, [groups, searchQuery, selectedLeaders]);

  /**
   * Handles toggle switch change with optimistic update and PATCH request
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

  return {
    churchId,

    // Tab state
    tab: {
      active: activeTab,
      onChange: setActiveTab,
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

