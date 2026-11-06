import { axiosClient as apiClient } from "../../../../../shared/models/api/axiosClient.api";
import type {
  PostDiscussionQuestionPayload,
  PostDiscussionQuestionResponse,
} from "../types/groupsScheduleDirectory.types";

/**
 * API service for Admin discipleship discussion questions.
 */
export const DiscipleshipDiscussionApi = {
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

