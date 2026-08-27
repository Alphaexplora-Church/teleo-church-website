// ─── Admin Content — Journeys/Series: Service (Model) ───────────────────────
// NOTE: The backend does not yet expose `/api/contents/admin/journeys`
// endpoints (only `event`/`announcement` content types exist today — see
// AdminEventsService). Persistence below is implemented against
// localStorage so the flow is fully usable end-to-end in the meantime; the
// public async signatures mirror AdminEventsService so swapping the body of
// each function for a real `authFetch` call later is a drop-in change.
import type { Journey, JourneyFormData, JourneyPart, JourneyStatus, PartFormData } from './adminContent.types';

const STORAGE_KEY = 'teleo_admin_journeys';

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const readAll = (): Journey[] => {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) as Journey[] : [];
    } catch {
        return [];
    }
};

const writeAll = (journeys: Journey[]) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(journeys));
};

/** Simulates network latency so loading states are exercised realistically. */
const settle = <T>(value: T, delay = 250): Promise<T> =>
    new Promise(resolve => window.setTimeout(() => resolve(value), delay));

// ─── Video link validation ───────────────────────────────────────────────
export interface VideoPreview {
    title: string;
    thumbnail: string;
}

const YOUTUBE_RE = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/i;
const VIMEO_RE = /vimeo\.com\/(?:video\/)?(\d+)/i;

/**
 * Validates a pasted video link and resolves its title + thumbnail via the
 * provider's public oEmbed endpoint (no API key required). Returns `null`
 * when the link is broken, unreachable, or from an unsupported provider —
 * callers should surface this as "the link could not be used".
 */
export async function validateVideoLink(url: string): Promise<VideoPreview | null> {
    const trimmed = url.trim();
    if (!trimmed) return null;

    let oEmbedUrl: string | null = null;
    if (YOUTUBE_RE.test(trimmed)) {
        oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(trimmed)}&format=json`;
    } else if (VIMEO_RE.test(trimmed)) {
        oEmbedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(trimmed)}`;
    } else {
        return null; // unsupported / malformed link
    }

    try {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 6000);
        const response = await fetch(oEmbedUrl, { signal: controller.signal });
        window.clearTimeout(timeout);
        if (!response.ok) return null;

        const json = await response.json() as { title?: string; thumbnail_url?: string };
        if (!json.title) return null;
        return { title: json.title, thumbnail: json.thumbnail_url ?? '' };
    } catch {
        return null; // network error, blocked request, or broken link
    }
}

// ─── Journey (Series) persistence ────────────────────────────────────────
export const AdminContentService = {
    fetchJourneys: async (): Promise<Journey[]> => {
        return settle(readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    },

    /** Phase 1: Initialization & Metadata — creates the shell of a new journey. */
    createJourney: async (form: JourneyFormData): Promise<Journey> => {
        const now = new Date().toISOString();
        const journey: Journey = {
            id: uid(),
            title: form.title.trim(),
            description: form.description.trim(),
            contentType: form.contentType,
            categories: form.categories,
            summary: form.summary.trim() || undefined,
            parts: [],
            status: 'draft',
            createdAt: now,
            updatedAt: now,
        };
        const all = readAll();
        writeAll([journey, ...all]);
        return settle(journey);
    },

    /**
     * Phase 1 (Saving & Publication States) / Phase 1.1 (Save & Status
     * Maintenance): persists metadata + parts. `nextStatus` lets the caller
     * explicitly Publish; when omitted the journey's current status is
     * retained per the edit-flow rule.
     */
    saveJourney: async (
        id: string,
        form: JourneyFormData,
        parts: JourneyPart[],
        nextStatus?: JourneyStatus,
    ): Promise<Journey> => {
        const all = readAll();
        const index = all.findIndex(item => item.id === id);
        if (index === -1) throw new Error('Journey not found');

        const updated: Journey = {
            ...all[index],
            title: form.title.trim(),
            description: form.description.trim(),
            contentType: form.contentType,
            categories: form.categories,
            summary: form.summary.trim() || undefined,
            parts,
            status: nextStatus ?? all[index].status,
            updatedAt: new Date().toISOString(),
        };
        all[index] = updated;
        writeAll(all);
        return settle(updated);
    },

    deleteJourney: async (id: string): Promise<void> => {
        writeAll(readAll().filter(item => item.id !== id));
        return settle(undefined);
    },

    /** Persists a new Part order. Payload is `[{ partId, position }]`, 1-based; completion progress is untouched server-side. */
    reorderParts: async (journeyId: string, payload: { partId: string; position: number }[]): Promise<Journey> => {
        const all = readAll();
        const index = all.findIndex(item => item.id === journeyId);
        if (index === -1) throw new Error('Journey not found');

        const positionById = new Map(payload.map(item => [item.partId, item.position]));
        const parts = [...all[index].parts]
            .map(part => ({ ...part, order: positionById.get(part.id) ?? part.order }))
            .sort((a, b) => a.order - b.order);

        const updated: Journey = { ...all[index], parts, updatedAt: new Date().toISOString() };
        all[index] = updated;
        writeAll(all);
        return settle(updated);
    },

    /** Quick lifecycle transition used by the list view's Archive/Restore actions (does not touch metadata or parts). */
    setStatus: async (id: string, status: JourneyStatus): Promise<Journey> => {
        const all = readAll();
        const index = all.findIndex(item => item.id === id);
        if (index === -1) throw new Error('Journey not found');

        const updated: Journey = { ...all[index], status, updatedAt: new Date().toISOString() };
        all[index] = updated;
        writeAll(all);
        return settle(updated);
    },
};

/** Builds a JourneyPart from the Part builder's form state, preserving id/order when editing. */
export function buildPart(form: PartFormData, existing?: JourneyPart, order?: number): JourneyPart {
    return {
        id: existing?.id ?? uid(),
        order: existing?.order ?? order ?? 1,
        title: form.title.trim(),
        type: form.type,
        status: form.status,
        videoUrl: form.type !== 'text' ? form.videoUrl.trim() : undefined,
        videoTitle: form.type !== 'text' ? existing?.videoTitle ?? null : null,
        videoThumbnail: form.type !== 'text' ? existing?.videoThumbnail ?? null : null,
        textContent: form.type !== 'video' ? form.textContent.trim() : undefined,
    };
}
