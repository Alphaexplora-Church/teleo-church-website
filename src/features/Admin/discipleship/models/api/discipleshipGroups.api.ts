import { axiosClient as apiClient } from "../../../../../shared/models/api/axiosClient.api";
import type {
  AssignDisciplerPayload,
  AssignDisciplerResponse,
  CreateDiscipleshipGroupPayload,
  CreateDiscipleshipGroupResponse,
  DisciplerCandidatesResponse,
  ApiDisciplerCandidate,
  UpdateDiscipleshipGroupPayload,
  UpdateDiscipleshipGroupResponse,
  LeadershipHandoffPayload,
  LeadershipHandoffResponse,
  ApiDiscipleshipMember,
} from "../types/groupsScheduleDirectory.types";

/**
 * API service for Admin discipleship group CRUD, discipler assignment,
 * and discipler candidate discovery.
 */
export const DiscipleshipGroupsApi = {
  /**
   * Creates a new discipleship group within a church.
   * Admin Endpoint: POST /api/discipleships
   */
  createGroup: async (
    payload: CreateDiscipleshipGroupPayload,
    signal?: AbortSignal,
  ): Promise<CreateDiscipleshipGroupResponse> => {
    const response = await apiClient.post<CreateDiscipleshipGroupResponse>(
      "/api/discipleships",
      payload,
      { signal },
    );
    return response.data;
  },

  /**
   * Assigns a discipler/leader to a discipleship group.
   * Admin Endpoint: POST /api/discipleships/:id/disciplers
   */
  assignDiscipler: async (
    discipleshipId: string,
    payload: AssignDisciplerPayload,
    signal?: AbortSignal,
  ): Promise<AssignDisciplerResponse> => {
    const response = await apiClient.post<AssignDisciplerResponse>(
      `/api/discipleships/${discipleshipId}/disciplers`,
      payload,
      { signal },
    );
    return response.data;
  },

  /**
   * Lists eligible members to lead discipleship groups.
   * Admin Endpoint: GET /api/churches/:churchId/discipler-candidates
   */
  getDisciplerCandidates: async (
    churchId: string | number,
    signal?: AbortSignal,
  ): Promise<ApiDisciplerCandidate[]> => {
    const response = await apiClient.get<DisciplerCandidatesResponse | ApiDisciplerCandidate[]>(
      `/api/churches/${churchId}/discipler-candidates`,
      { signal },
    );

    // Fallback handling: handle { candidates: [...] } or direct array [...]
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && Array.isArray(response.data.candidates)) {
      return response.data.candidates;
    }
    return [];
  },

  /**
   * Edits discipleship group details (name, capacity limit, status).
   * Admin Endpoint: PATCH /api/discipleships/:id
   */
  updateGroup: async (
    id: string,
    payload: UpdateDiscipleshipGroupPayload,
    signal?: AbortSignal,
  ): Promise<UpdateDiscipleshipGroupResponse> => {
    const response = await apiClient.patch<UpdateDiscipleshipGroupResponse>(
      `/api/discipleships/${id}`,
      payload,
      { signal },
    );
    return response.data;
  },
  /**
   * Reassigns a group's discipler to an incoming candidate with audit log.
   * Admin Endpoint: POST /api/discipleship-leadership-handoffs
   */
  executeLeadershipHandoff: async (
    payload: LeadershipHandoffPayload,
    signal?: AbortSignal,
  ): Promise<LeadershipHandoffResponse> => {
    const response = await apiClient.post<LeadershipHandoffResponse>(
      "/api/discipleship-leadership-handoffs",
      payload,
      { signal },
    );
    return response.data;
  },

  /**
   * Fetches active and paused members of a discipleship group.
   * Endpoint: GET /api/discipleship-members?discipleship_id=
   */
  getGroupMembers: async (
    discipleshipId: string,
    signal?: AbortSignal,
  ): Promise<ApiDiscipleshipMember[]> => {
    const response = await apiClient.get<any>(
      `/api/discipleship-members?discipleship_id=${discipleshipId}`,
      {
        signal,
      },
    );
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.members)) {
      return response.data.members;
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (response.data?.data && Array.isArray(response.data.data.members)) {
      return response.data.data.members;
    }
    return [];
  },

  /**
   * Updates membership status (e.g. 'removed', 'left', 'active').
   * Endpoint: PATCH /api/discipleship-members/:memberId
   */
  updateMemberStatus: async (
    memberId: string,
    status: "active" | "paused" | "left" | "removed",
    signal?: AbortSignal,
  ): Promise<{ status: string }> => {
    if (!memberId || memberId === "undefined") {
      console.warn("Attempted to update member status with invalid memberId:", memberId);
      return { status: "invalid" };
    }
    const response = await apiClient.patch<{ status: string }>(
      `/api/discipleship-members/${memberId}`,
      { status },
      { signal },
    );
    return response.data;
  },
};

export default DiscipleshipGroupsApi;

