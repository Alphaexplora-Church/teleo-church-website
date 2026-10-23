// ─── Admin Events: Service (Model) ──────────────────────────────────────────
import type { ChurchEvent, Announcement, AdminContentStats } from './content.types';
import type { EventFormData } from './adminEvents.types';
import { axiosClient } from '../../../../shared/models/api/axiosClient.api';

/**
 * The request body, in the events_announcements schema's terms: an event has
 * a description, location and dates; an announcement has content (the
 * form's description field) and nothing else.
 */
const buildFormData = (data: EventFormData, type: string): FormData => {
    const formData = new FormData();
    formData.append('post_type', type);
    formData.append('title', data.title);

    if (type === 'announcement') {
        if (data.description) formData.append('content', data.description);
    } else {
        if (data.description) formData.append('description', data.description);
        if (data.location) formData.append('location', data.location);

        if (data.start_date_date) {
            const time = data.start_date_time || '00:00';
            formData.append('start_date', `${data.start_date_date}T${time}:00`);
        }

        if (data.end_date_date) {
            const time = data.end_date_time || '00:00';
            formData.append('end_date', `${data.end_date_date}T${time}:00`);
        }
    }

    if (data.image) {
        formData.append('image', data.image);
    }

    return formData;
};

interface CollectionResponse<T> {
    data?: T[];
    total?: number;
    meta?: { total?: number; pagination?: { total?: number } };
    pagination?: { total?: number };
}

const parseTotalFromResponse = <T>(json: unknown): { items: T[]; total: number } => {
    const response = json as CollectionResponse<T>;
    const items = response.data ?? [];
    const total = response.total
        ?? response.meta?.total
        ?? response.pagination?.total
        ?? response.meta?.pagination?.total
        ?? items.length;
    return { items, total };
};

export const AdminEventsService = {
    fetchStats: async (): Promise<AdminContentStats> => {
        const response = await axiosClient.get<{ data: AdminContentStats }>('/api/contents/admin/stats');
        return response.data.data;
    },

    /**
     * Fetches all events from the admin endpoint (requires authentication).
     */
    fetchEvents: async (page: number = 1, limit: number = 10): Promise<{ items: ChurchEvent[]; total: number }> => {
        const response = await axiosClient.get<CollectionResponse<ChurchEvent>>('/api/contents/admin/events', {
            params: { page, limit },
        });
        return parseTotalFromResponse<ChurchEvent>(response.data);
    },

    /**
     * Fetches all announcements from the admin endpoint (requires authentication).
     */
    fetchAnnouncements: async (page: number = 1, limit: number = 10): Promise<{ items: Announcement[]; total: number }> => {
        const response = await axiosClient.get<CollectionResponse<Announcement>>('/api/contents/admin/announcements', {
            params: { page, limit },
        });
        return parseTotalFromResponse<Announcement>(response.data);
    },

    /**
     * Creates a new event (requires authentication).
     */
    createEvent: async (data: EventFormData, type: string = 'event'): Promise<void> => {
        const formData = buildFormData(data, type);
        await axiosClient.post('/api/contents/admin', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    /**
     * Updates an existing event by ID (requires authentication).
     */
    updateEvent: async (id: string, data: EventFormData, type: string = 'event'): Promise<void> => {
        const formData = buildFormData(data, type);
        await axiosClient.patch(`/api/contents/admin/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    /**
     * Deletes an event by ID (requires authentication).
     */
    archiveContent: async (id: string): Promise<void> => {
        await axiosClient.delete(`/api/contents/admin/${id}`);
    },
};
