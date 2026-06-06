// ─── Admin Events: Service (Model) ──────────────────────────────────────────
import type { ChurchEvent, Announcement } from '../../Experience/events/events.types';
import type { EventFormData } from './adminEvents.types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

/** Retrieves the stored JWT and builds the Authorization header. */
const getAuthHeaders = (isFormData: boolean = false): HeadersInit => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No auth token found. Please log in.');

    const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
    };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
};

const buildFormData = (data: EventFormData, type: string): FormData => {
    const formData = new FormData();
    formData.append('type_content', type);
    formData.append('title', data.title);

    if (data.description) formData.append('description', data.description);
    if (data.location) formData.append('location', data.location);
    if (data.category_content) formData.append('category_content', data.category_content);

    if (data.start_date_date) {
        const time = data.start_date_time || '00:00';
        formData.append('start_date', `${data.start_date_date}T${time}:00`);
    }

    if (data.end_date_date) {
        const time = data.end_date_time || '00:00';
        formData.append('end_date', `${data.end_date_date}T${time}:00`);
    }

    if (data.image) {
        formData.append('image', data.image);
    }

    return formData;
};

const parseTotalFromResponse = <T>(json: any): { items: T[]; total: number } => {
    const items = (json.data ?? []) as T[];
    const total = json.total ?? json.meta?.total ?? json.pagination?.total ?? json.meta?.pagination?.total ?? items.length;
    return { items, total };
};

export const AdminEventsService = {
    /**
     * Fetches all events from the admin endpoint (requires authentication).
     */
    fetchEvents: async (page: number = 1, limit: number = 10): Promise<{ items: ChurchEvent[]; total: number }> => {
        const response = await fetch(`${API_BASE}/api/contents/admin/events?page=${page}&limit=${limit}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch events');
        const json = await response.json();
        return parseTotalFromResponse<ChurchEvent>(json);
    },

    /**
     * Fetches all announcements from the admin endpoint (requires authentication).
     */
    fetchAnnouncements: async (page: number = 1, limit: number = 10): Promise<{ items: Announcement[]; total: number }> => {
        const response = await fetch(`${API_BASE}/api/contents/admin/announcements?page=${page}&limit=${limit}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch announcements');
        const json = await response.json();
        return parseTotalFromResponse<Announcement>(json);
    },

    /**
     * Creates a new event (requires authentication).
     */
    createEvent: async (data: EventFormData, type: string = 'event'): Promise<void> => {
        const formData = buildFormData(data, type);
        const response = await fetch(`${API_BASE}/api/contents/admin`, {
            method: 'POST',
            headers: getAuthHeaders(true),
            body: formData,
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to create event: ${errorBody}`);
        }
    },

    /**
     * Updates an existing event by ID (requires authentication).
     */
    updateEvent: async (id: number, data: EventFormData, type: string = 'event'): Promise<void> => {
        const formData = buildFormData(data, type);
        const response = await fetch(`${API_BASE}/api/contents/admin/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(true),
            body: formData,
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to update event: ${errorBody}`);
        }
    },

    /**
     * Deletes an event by ID (requires authentication).
     */
    deleteEvent: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE}/api/contents/admin/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete event');
    },
};
