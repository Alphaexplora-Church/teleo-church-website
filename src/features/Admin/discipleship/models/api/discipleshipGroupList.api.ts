import { axiosClient as apiClient } from "../../../../../shared/models/api/axiosClient.api";
import type {
  DiscipleshipDashboardResponse,
  ToggleDiscipleshipModulePayload,
  ToggleDiscipleshipModuleResponse,
} from "../types/groupsScheduleDirectory.types";

/**
 * Service layer for church-wide discipleship management.
 * Wired directly to Node.js Express API backend according to documentation:
 * - Admin Journey 13a: GET /churches/:churchId/discipleship-dashboard
 * - Admin Journey 9a:  PATCH /churches/:churchId/modules
 */
export const DiscipleshipService = {
  /**
   * Fetches church-wide groups directory, headcount vs. capacity, and per-discipler load.
   * Admin Journey 13a: GET /churches/:churchId/discipleship-dashboard
   */
  getDiscipleshipDashboard: async (
    churchId: string | number,
    signal?: AbortSignal,
  ): Promise<DiscipleshipDashboardResponse> => {
    const response = await apiClient.get<DiscipleshipDashboardResponse>(
      `/churches/${churchId}/discipleship-dashboard`,
      { signal },
    );
    return response.data;
  },

  /**
   * Toggles the Discipleship module state for the specified church.
   * Admin Journey 9a: PATCH /churches/:churchId/modules
   */
  toggleDiscipleshipModule: async (
    churchId: string | number,
    payload: ToggleDiscipleshipModulePayload,
    signal?: AbortSignal,
  ): Promise<ToggleDiscipleshipModuleResponse> => {
    const response = await apiClient.patch<ToggleDiscipleshipModuleResponse>(
      `/churches/${churchId}/modules`,
      payload,
      { signal },
    );
    return response.data;
  },
};

export default DiscipleshipService;
