// ─── Admin Registrations: Service (Model) ─────────────────────────────────────
import type { Registration } from './adminRegistrations.types';
import type { EncounterRegistration } from './adminEncounterRegistrations.types';
import type { DiscipleshipRegistration } from './adminDiscipleshipRegistrations.types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

const authHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No auth token found. Please log in.');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

interface CollectionResponse<T> {
    data?: T[];
    total?: number;
    meta?: { total?: number; pagination?: { total?: number } };
    pagination?: { total?: number };
}

type WithCreatedAt<T> = T & { created_at?: string };

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

export const AdminRegistrationsService = {
    /**
     * Fetches plan-a-visit registrations (requires authentication).
     * GET /api/wlcm/registrations
     */
    fetchAll: async (page: number = 1, limit: number = 10): Promise<{ items: Registration[]; total: number }> => {
        const response = await fetch(`${API_BASE}/api/wlcm/registrations?page=${page}&limit=${limit}`, {
            headers: authHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch plan-a-visit registrations');
        const json = await response.json();
        const { items, total } = parseTotalFromResponse<WithCreatedAt<Registration>>(json);
        return {
            items: items.map(item => ({
                ...item,
                submitted_at: item.submitted_at || item.created_at || '',
            })),
            total,
        };
    },

    /**
     * Fetches Encounter (Discover Purpose) registrations.
     * GET /api/wlcm/encounter
     */
    fetchAllEncounter: async (page: number = 1, limit: number = 10): Promise<{ items: EncounterRegistration[]; total: number }> => {
        const response = await fetch(`${API_BASE}/api/wlcm/encounter?page=${page}&limit=${limit}`, {
            headers: authHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch encounter registrations');
        const json = await response.json();
        const { items, total } = parseTotalFromResponse<WithCreatedAt<EncounterRegistration>>(json);
        return {
            items: items.map(item => ({
                ...item,
                submitted_at: item.submitted_at || item.created_at || '',
            })),
            total,
        };
    },

    /**
     * Fetches Discipleship (Contact form) submissions.
     * GET /api/wlcm/discipleship
     */
    fetchAllDiscipleship: async (page: number = 1, limit: number = 10): Promise<{ items: DiscipleshipRegistration[]; total: number }> => {
        const response = await fetch(`${API_BASE}/api/wlcm/discipleship?page=${page}&limit=${limit}`, {
            headers: authHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch discipleship submissions');
        const json = await response.json();
        const { items, total } = parseTotalFromResponse<WithCreatedAt<DiscipleshipRegistration>>(json);
        return {
            items: items.map(item => ({
                ...item,
                submitted_at: item.submitted_at || item.created_at || '',
            })),
            total,
        };
    },
};
