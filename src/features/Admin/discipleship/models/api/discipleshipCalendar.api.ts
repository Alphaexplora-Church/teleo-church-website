import { axiosClient as apiClient } from "../../../../../shared/models/api/axiosClient.api";
import type { DiscipleshipCalendarResponse } from "../types/discipleshipCalendar.types";

/**
 * API layer for church-wide discipleship meeting calendar.
 * Aligned with Admin Journey 13b: GET /api/churches/:churchId/discipleship-calendar
 */
export const DiscipleshipCalendarApi = {
  getChurchDiscipleshipCalendar: async (
    churchId: string | number,
    signal?: AbortSignal,
  ): Promise<DiscipleshipCalendarResponse> => {
    const response = await apiClient.get<DiscipleshipCalendarResponse>(
      `/api/churches/${churchId}/discipleship-calendar`,
      { signal },
    );
    return response.data;
  },
};

export default DiscipleshipCalendarApi;
