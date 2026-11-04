import type {
    AdminPrayer,
    AdminPrayerComment,
    AdminPrayerPage,
    FetchAdminPrayersParams,
    FetchIntercessionParams
} from './adminPrayerWall.types';
import { axiosClient, getApiErrorMessage } from '../../../../shared/models/api/axiosClient.api';

interface AdminPrayersApiResponse {
    data?: (AdminPrayer & { prayer_id?: string })[];
    meta?: { next_cursor: string | null; has_more: boolean };
}

export const AdminPrayerWallModel = {
    /**
     * Fetches the admin church prayer feed.
     * GET /api/prayers/admin/churches
     */
    fetchChurchPrayers: async ({ churchId, cursor, limit = 20 }: FetchAdminPrayersParams = {}): Promise<AdminPrayerPage> => {
        const params: Record<string, string> = { limit: String(limit) };
        if (churchId != null) params.church_id = String(churchId);
        if (cursor) params.cursor = cursor;

        const response = await axiosClient.get<AdminPrayersApiResponse>('/api/prayers/admin/churches', { params });
        const json = response.data;
        const items: AdminPrayer[] = (json.data ?? []).map(p => ({
            ...p,
            id: p.id || p.prayer_id || ''
        }));

        return {
            items,
            nextCursor: json.meta?.next_cursor ?? null,
            hasMore: json.meta?.has_more ?? false,
        };
    },

    /**
     * Fetches the Church Intercession queue for pastoral teams.
     * GET /api/prayers/admin/intercession
     */
    fetchIntercessionQueue: async ({ churchId, status = 'ALL', cursor, limit = 20 }: FetchIntercessionParams = {}): Promise<AdminPrayerPage> => {
        const params: Record<string, string> = { limit: String(limit) };
        if (churchId != null) params.church_id = String(churchId);
        if (status) params.status = status;
        if (cursor) params.cursor = cursor;

        const response = await axiosClient.get<AdminPrayersApiResponse>('/api/prayers/admin/intercession', { params });
        const json = response.data;
        const items: AdminPrayer[] = (json.data ?? []).map(p => ({
            ...p,
            id: p.prayer_id || p.id || '',
            is_prayed_by_church: p.team_status === 'PRAYED' || (p.times_prayed_by_team ?? 0) > 0,
            times_prayed_by_church: p.times_prayed_by_team ?? 0
        }));

        return {
            items,
            nextCursor: json.meta?.next_cursor ?? null,
            hasMore: json.meta?.has_more ?? false,
        };
    },

    /**
     * Fetches full single prayer details including comment thread.
     * GET /api/prayers/:id
     */
    fetchPrayerById: async (prayerId: string): Promise<AdminPrayer> => {
        const response = await axiosClient.get<AdminPrayer>(`/api/prayers/${prayerId}`);
        const json = response.data;
        return {
            ...json,
            id: json.id || json.prayer_id || ''
        };
    },

    /**
     * Toggles 'PRAYED' reaction on a prayer post.
     * POST /api/prayers/:id/react { reaction_type: 'PRAYED' }
     */
    toggleMarkAsPrayed: async (prayerId: string): Promise<{ action: 'added' | 'removed' }> => {
        try {
            const response = await axiosClient.post<{ action: 'added' | 'removed' }>(
                `/api/prayers/${prayerId}/react`,
                { reaction_type: 'PRAYED' }
            );
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error) || 'Failed to update prayer reaction');
        }
    },

    /**
     * Posts a pastoral encouragement comment.
     * POST /api/prayers/:id/comments
     */
    addComment: async (prayerId: string, content: string): Promise<AdminPrayerComment> => {
        try {
            const response = await axiosClient.post<AdminPrayerComment>(
                `/api/prayers/${prayerId}/comments`,
                { content }
            );
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error) || 'Failed to post comment');
        }
    },

    /**
     * Updates an existing pastoral comment.
     * PUT /api/prayers/:id/comments/:commentId
     */
    updateComment: async (prayerId: string, commentId: string, content: string): Promise<AdminPrayerComment> => {
        try {
            const response = await axiosClient.put<AdminPrayerComment>(
                `/api/prayers/${prayerId}/comments/${commentId}`,
                { content }
            );
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error) || 'Failed to update comment');
        }
    },

    /**
     * Deletes a pastoral comment.
     * DELETE /api/prayers/:id/comments/:commentId
     */
    deleteComment: async (prayerId: string, commentId: string): Promise<{ message: string }> => {
        try {
            const response = await axiosClient.delete<{ message: string }>(
                `/api/prayers/${prayerId}/comments/${commentId}`
            );
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error) || 'Failed to delete comment');
        }
    }
};
