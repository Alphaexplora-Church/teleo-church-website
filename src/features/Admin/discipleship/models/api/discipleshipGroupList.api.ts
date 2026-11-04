import { axiosClient as apiClient } from "../../../../../shared/models/api/axiosClient.api";
import type { DiscipleshipDashboardResponse } from "../types/groupsScheduleDirectory.types";

/**
 * API layer for church-wide discipleship groups directory and dashboard.
 * Wired directly to Node.js Express API backend according to documentation:
 * - Admin Journey 13a: GET /api/churches/:churchId/discipleship-dashboard
 */
export const DiscipleshipGroupListApi = {
  /**
   * Fetches church-wide groups directory, headcount vs. capacity, and per-discipler load.
   * Admin Journey 13a: GET /api/churches/:churchId/discipleship-dashboard
   */
  getDiscipleshipDashboard: async (
    churchId: string | number,
    signal?: AbortSignal,
  ): Promise<DiscipleshipDashboardResponse> => {
    const response = await apiClient.get<DiscipleshipDashboardResponse>(
      `/api/churches/${churchId}/discipleship-dashboard`,
      { signal },
    );
    return response.data;
  },
};

export default DiscipleshipGroupListApi;
