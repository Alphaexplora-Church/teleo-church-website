import type {
  ToggleDiscipleshipModulePayload,
  ToggleDiscipleshipModuleResponse,
} from "../types/groupsScheduleDirectory.types";

/**
 * =========================================================================================
 * [FEATURE ON HOLD / UNDER DECISION]
 * Documentation: Church-Wide Discipleship Module Toggle API
 * 
 * Description:
 * Endpoint used to turn the discipleship feature ON or OFF church-wide for mobile app users.
 * When disabled, church members on the mobile app cannot browse, join, or view discipleship
 * groups under this church.
 * 
 * HTTP Specification (Section 1 in DISCIPLESHIP_API.md):
 * - Method: PATCH
 * - Endpoint: /api/churches/:churchId/modules
 * - Headers:
 *     Authorization: Bearer <token> (Required, Admin role)
 * - Path Parameters:
 *     churchId: Integer ID of the church (Required)
 * - Request Body:
 *     {
 *       "discipleship_enabled": boolean // true = enable, false = disable
 *     }
 * - Success Response (HTTP 200):
 *     {
 *       "discipleship_enabled": boolean
 *     }
 * 
 * Status:
 * Currently commented out / put on hold pending church administration & mobile rollout
 * decisions. Uncomment DiscipleshipModuleApi implementation when feature is ready for release.
 * =========================================================================================
 */

// import { axiosClient as apiClient } from "../../../../../shared/models/api/axiosClient.api";

export const DiscipleshipModuleApi = {
  /**
   * Toggles the Discipleship module state for the specified church.
   * Admin Endpoint: PATCH /api/churches/:churchId/modules
   * 
   * NOTE: Temporarily in mock/no-op mode while UI switch is hidden.
   */
  toggleDiscipleshipModule: async (
    churchId: string | number,
    payload: ToggleDiscipleshipModulePayload,
    signal?: AbortSignal,
  ): Promise<ToggleDiscipleshipModuleResponse> => {
    void churchId;
    void signal;
    /*
    const response = await apiClient.patch<ToggleDiscipleshipModuleResponse>(
      `/api/churches/${churchId}/modules`,
      payload,
      { signal },
    );
    return response.data;
    */
    return Promise.resolve({
      discipleship_enabled: payload.discipleship_enabled,
    });
  },
};

export default DiscipleshipModuleApi;
