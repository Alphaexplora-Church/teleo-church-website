import { axiosClient as apiClient } from "../../../../../shared/models/api/axiosClient.api";
import type {
  ApiDiscussionQuestion,
  PostDiscussionQuestionPayload,
  PostDiscussionQuestionResponse,
} from "../types/groupsScheduleDirectory.types";

/**
 * API service for Admin discipleship discussion questions.
 */
export const DiscipleshipDiscussionApi = {
  /**
   * Retrieves active or church discussion questions.
   * Admin Endpoint: GET /api/discipleship-discussion-questions?church_id=:churchId
   */
  getDiscussionQuestions: async (
    churchId: string | number,
    signal?: AbortSignal,
  ): Promise<ApiDiscussionQuestion | ApiDiscussionQuestion[] | null> => {
    const response = await apiClient.get<ApiDiscussionQuestion | ApiDiscussionQuestion[]>(
      `/api/discipleship-discussion-questions?church_id=${churchId}`,
      { signal },
    );
    return response.data;
  },

  /**
   * Posts a church-wide weekly or monthly discussion question.
   * Archives previous active questions automatically on the backend.
   * Admin Endpoint: POST /api/discipleship-discussion-questions
   */
  postDiscussionQuestion: async (
    payload: PostDiscussionQuestionPayload,
    signal?: AbortSignal,
  ): Promise<PostDiscussionQuestionResponse> => {
    const response = await apiClient.post<PostDiscussionQuestionResponse>(
      "/api/discipleship-discussion-questions",
      payload,
      { signal },
    );
    return response.data;
  },
};

export default DiscipleshipDiscussionApi;

