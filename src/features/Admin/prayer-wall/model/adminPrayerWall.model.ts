import type {
    AdminPrayer,
    AdminPrayerComment,
    AdminPrayerPage,
    FetchAdminPrayersParams,
    FetchIntercessionParams
} from './adminPrayerWall.types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

/** Wraps fetch to always send the HTTP-only auth cookies to the API. */
const authFetch = (url: string, init: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem('access_token');
    const headers = new Headers(init.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(url, { ...init, headers, credentials: 'include' });
};

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
        const query = new URLSearchParams();
        if (churchId != null) query.set('church_id', String(churchId));
        if (cursor) query.set('cursor', cursor);
        query.set('limit', String(limit));

        const response = await authFetch(`${API_BASE}/api/prayers/admin/churches?${query.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch church prayer requests');

        const json = await response.json() as AdminPrayersApiResponse;
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
        const query = new URLSearchParams();
        if (churchId != null) query.set('church_id', String(churchId));
        if (status) query.set('status', status);
        if (cursor) query.set('cursor', cursor);
        query.set('limit', String(limit));

        const response = await authFetch(`${API_BASE}/api/prayers/admin/intercession?${query.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch intercession queue');

        const json = await response.json() as AdminPrayersApiResponse;
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
        const response = await authFetch(`${API_BASE}/api/prayers/${prayerId}`);
        if (!response.ok) throw new Error('Failed to fetch prayer details');
        const json = await response.json() as AdminPrayer;
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
        const response = await authFetch(`${API_BASE}/api/prayers/${prayerId}/react`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reaction_type: 'PRAYED' })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || err.error || 'Failed to update prayer reaction');
        }

        return await response.json() as { action: 'added' | 'removed' };
    },

    /**
     * Posts a pastoral encouragement comment.
     * POST /api/prayers/:id/comments
     */
    addComment: async (prayerId: string, content: string): Promise<AdminPrayerComment> => {
        const response = await authFetch(`${API_BASE}/api/prayers/${prayerId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || err.error || 'Failed to post comment');
        }

        return await response.json() as AdminPrayerComment;
    },

    /**
     * Updates an existing pastoral comment.
     * PUT /api/prayers/:id/comments/:commentId
     */
    updateComment: async (prayerId: string, commentId: string, content: string): Promise<AdminPrayerComment> => {
        const response = await authFetch(`${API_BASE}/api/prayers/${prayerId}/comments/${commentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || err.error || 'Failed to update comment');
        }

        return await response.json() as AdminPrayerComment;
    },

    /**
     * Deletes a pastoral comment.
     * DELETE /api/prayers/:id/comments/:commentId
     */
    deleteComment: async (prayerId: string, commentId: string): Promise<{ message: string }> => {
        const response = await authFetch(`${API_BASE}/api/prayers/${prayerId}/comments/${commentId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || err.error || 'Failed to delete comment');
        }

        return await response.json() as { message: string };
    }
};
