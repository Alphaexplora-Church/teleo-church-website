// ─── Admin Registrations: Service (Model) ─────────────────────────────────────
import type { Registration } from './adminRegistrations.types';
import type { EncounterRegistration } from './adminEncounterRegistrations.types';
import type { DiscipleshipRegistration } from './adminDiscipleshipRegistrations.types';
import { axiosClient } from '../../../../shared/models/api/axiosClient.api';

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
        // eslint-disable-next-line prefer-const
        let disableApi = true;
        if (disableApi) return { items: [], total: 0 };

        const response = await axiosClient.get<CollectionResponse<WithCreatedAt<Registration>>>('/api/wlcm/registrations', {
            params: { page, limit },
        });
        const { items, total } = parseTotalFromResponse<WithCreatedAt<Registration>>(response.data);
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
        // eslint-disable-next-line prefer-const
        let disableApi = true;
        if (disableApi) return { items: [], total: 0 };

        const response = await axiosClient.get<CollectionResponse<WithCreatedAt<EncounterRegistration>>>('/api/wlcm/encounter', {
            params: { page, limit },
        });
        const { items, total } = parseTotalFromResponse<WithCreatedAt<EncounterRegistration>>(response.data);
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
        // eslint-disable-next-line prefer-const
        let disableApi = true;
        if (disableApi) return { items: [], total: 0 };

        const response = await axiosClient.get<CollectionResponse<WithCreatedAt<DiscipleshipRegistration>>>('/api/wlcm/discipleship', {
            params: { page, limit },
        });
        const { items, total } = parseTotalFromResponse<WithCreatedAt<DiscipleshipRegistration>>(response.data);
        return {
            items: items.map(item => ({
                ...item,
                submitted_at: item.submitted_at || item.created_at || '',
            })),
            total,
        };
    },
};
