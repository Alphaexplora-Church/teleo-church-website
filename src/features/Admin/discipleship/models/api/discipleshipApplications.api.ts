import { axiosClient as apiClient } from "../../../../../shared/models/api/axiosClient.api";
import type {
  ApiDiscipleshipApplication,
  ApiApplicationDetail,
  ApiApplicationApplicant,
  ApiIntakeFormTemplate,
  CreateIntakeTemplatePayload,
  DiscipleshipApplicationDetailResponse,
  DiscipleshipApplicationsResponse,
  IntakeFormTemplateResponse,
  ReviewApplicationPayload,
  ReviewApplicationResponse,
} from "../types/discipleshipApplication.types";

export interface GetApplicationsParams {
  churchId?: string | number;
  status?: string;
}

/**
 * API service for Admin discipleship applications moderation,
 * applicant review, and intake form templates.
 */
export const DiscipleshipApplicationsApi = {
  /**
   * Fetches pending applications queue for a church.
   * Admin Endpoint: GET /api/discipleship-applications?status=pending&church_id=
   */
  getApplications: async (
    params?: GetApplicationsParams,
    signal?: AbortSignal,
  ): Promise<ApiDiscipleshipApplication[]> => {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.churchId !== undefined && params?.churchId !== null) {
      query.append("church_id", String(params.churchId));
    }

    const queryString = query.toString();
    const endpoint = `/api/discipleship-applications${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<DiscipleshipApplicationsResponse | ApiDiscipleshipApplication[]>(
      endpoint,
      { signal },
    );

    // Fallback handling: handle { applications: [...] } or direct array [...]
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && Array.isArray(response.data.applications)) {
      return response.data.applications;
    }
    return [];
  },

  /**
   * Fetches full application detail with applicant answers and flags.
   * Admin Endpoint: GET /api/discipleship-applications/:applicationId
   */
  getApplicationDetail: async (
    applicationId: string,
    signal?: AbortSignal,
  ): Promise<{ application?: ApiApplicationDetail; applicant?: ApiApplicationApplicant }> => {
    const response = await apiClient.get<DiscipleshipApplicationDetailResponse | ApiApplicationDetail>(
      `/api/discipleship-applications/${applicationId}`,
      { signal },
    );

    if (response.data && "application" in response.data) {
      return {
        application: response.data.application,
        applicant: response.data.applicant,
      };
    }
    return { application: response.data as ApiApplicationDetail };
  },

  /**
   * Approves (with group assignment) or rejects application.
   * Admin Endpoint: PATCH /api/discipleship-applications/:id
   */
  reviewApplication: async (
    id: string,
    payload: ReviewApplicationPayload,
    signal?: AbortSignal,
  ): Promise<ReviewApplicationResponse> => {
    const response = await apiClient.patch<ReviewApplicationResponse>(
      `/api/discipleship-applications/${id}`,
      payload,
      { signal },
    );
    return response.data;
  },

  /**
   * Fetches the active intake form template for a church.
   * Admin Endpoint: GET /api/discipleship-intake-form-templates?church_id=
   */
  getIntakeTemplate: async (
    churchId?: string | number,
    signal?: AbortSignal,
  ): Promise<ApiIntakeFormTemplate | null> => {
    const query = churchId !== undefined && churchId !== null ? `?church_id=${churchId}` : "";
    const response = await apiClient.get<IntakeFormTemplateResponse | ApiIntakeFormTemplate>(
      `/api/discipleship-intake-form-templates${query}`,
      { signal },
    );

    if (!response.data) return null;
    if ("template" in response.data && response.data.template) {
      return response.data.template;
    }
    if ("form_schema" in response.data) {
      return response.data as ApiIntakeFormTemplate;
    }
    return null;
  },

  /**
   * Creates or replaces the active profiling/intake form template.
   * Admin Endpoint: POST /api/discipleship-intake-form-templates
   */
  saveIntakeTemplate: async (
    payload: CreateIntakeTemplatePayload,
    signal?: AbortSignal,
  ): Promise<ApiIntakeFormTemplate> => {
    const response = await apiClient.post<ApiIntakeFormTemplate>(
      "/api/discipleship-intake-form-templates",
      payload,
      { signal },
    );
    return response.data;
  },
};

export default DiscipleshipApplicationsApi;

