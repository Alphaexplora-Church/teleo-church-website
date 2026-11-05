import { axiosClient as apiClient } from "../../../../../shared/models/api/axiosClient.api";
import type {
  ToggleDiscipleshipModulePayload,
  ToggleDiscipleshipModuleResponse,
} from "../types/groupsScheduleDirectory.types";

/**
 * API layer for church-wide discipleship module toggle settings.
 * Wired directly to Node.js Express API backend according to documentation:
 * - Admin Journey 9a: PATCH /api/churches/:churchId/modules
 */
export const DiscipleshipModuleApi = {
  /**
   * Toggles the Discipleship module state for the specified church.
   * Admin Journey 9a: PATCH /api/churches/:churchId/modules
   */
  toggleDiscipleshipModule: async (
    churchId: string | number,
    payload: ToggleDiscipleshipModulePayload,
    signal?: AbortSignal,
  ): Promise<ToggleDiscipleshipModuleResponse> => {
    const response = await apiClient.patch<ToggleDiscipleshipModuleResponse>(
      `/api/churches/${churchId}/modules`,
      payload,
      { signal },
    );
    return response.data;
  },
};

export default DiscipleshipModuleApi;
