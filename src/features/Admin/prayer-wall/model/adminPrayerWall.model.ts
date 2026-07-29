import type { AdminPrayer, AdminPrayerPage, FetchAdminPrayersParams } from './adminPrayerWall.types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

/** Wraps fetch to always send the HTTP-only auth cookies to the API. */
const authFetch = (url: string, init: RequestInit = {}): Promise<Response> =>
    fetch(url, { ...init, credentials: 'include' });

interface AdminPrayersApiResponse {
    data?: AdminPrayer[];
    meta?: { next_cursor: string | null; has_more: boolean };
}

export const AdminPrayerWallModel = {
    /**
     * Fetches the admin church prayer feed. `church_id` defaults to the
     * requesting Church Admin's own home church on the backend when omitted.
     * GET /api/prayers/admin/churches
     */
    fetchChurchPrayers: async ({ churchId, cursor, limit = 20 }: FetchAdminPrayersParams = {}): Promise<AdminPrayerPage> => {
        const query = new URLSearchParams();
        if (churchId != null) query.set('church_id', String(churchId));
        if (cursor) query.set('cursor', cursor);
        query.set('limit', String(limit));

        const response = await authFetch(`${API_BASE}/api/prayers/admin/churches?${query.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch prayer requests');

        const json = await response.json() as AdminPrayersApiResponse;
        return {
            items: json.data ?? [],
            nextCursor: json.meta?.next_cursor ?? null,
            hasMore: json.meta?.has_more ?? false,
        };
    },
};
