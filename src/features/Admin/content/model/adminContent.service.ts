// ─── Admin Content — Journeys/Series: Service (Model) ───────────────────────
// Backed by the Journey API. The lifecycle is status-driven (draft /
// published / archived) and nothing is ever hard-deleted, so there is no
// delete call here and no path from published back to draft — those are not
// omissions, the API deliberately does not expose them.
import type { Journey, JourneyContentType, JourneyFormData, JourneyPart, JourneyStatus, PartFormData, PartStatus } from './adminContent.types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

/** The session is authenticated via the HTTP-only access_token cookie sent with every request. */
const authFetch = (url: string, init: RequestInit = {}): Promise<Response> =>
    fetch(url, { ...init, credentials: 'include' });

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Errors come back as `{ status: 'failed', error }`; surface the API's own wording when it has one. */
const request = async (url: string, init: RequestInit, fallback: string): Promise<Response> => {
    const response = await authFetch(url, init);
    if (response.ok) return response;

    let message = fallback;
    try {
        const body = await response.json() as { error?: string };
        if (body.error) message = body.error;
    } catch {
        // Non-JSON body (gateway error page, empty 500) — keep the fallback.
    }
    throw new Error(message);
};

const patchJson = (url: string, body: unknown, fallback: string): Promise<Response> =>
    request(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    }, fallback);

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

// ─── API mapping ─────────────────────────────────────────────────────────
// The API's content_type values do not match the frontend's. Mapping is
// provisional — confirm the intended pairing with the team.
const CONTENT_TYPE_FROM_API: Record<string, JourneyContentType> = {
    sunday_service: 'sermon-series',
    bible_study: 'bible-study',
    devotional: 'devotional',
    general: 'discipleship-course',
};

interface ApiJourneyRow {
    journeyId: string;
    title: string;
    description: string | null;
    summary: string | null;
    contentType: string | null;
    status: JourneyStatus;
    categories: string[];
    totalPublishedParts: number;
    createdAt: string;
    updatedAt: string;
}

/** The list endpoint returns no Parts; only GET /api/journeys/:journeyId does. */
const toJourney = (row: ApiJourneyRow): Journey => ({
    id: row.journeyId,
    title: row.title,
    description: row.description ?? '',
    contentType: CONTENT_TYPE_FROM_API[row.contentType ?? ''] ?? 'sermon-series',
    categories: row.categories ?? [],
    summary: row.summary ?? undefined,
    parts: [],
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
});

interface ApiPartRow {
    partId: string;
    partOrder: number;
    title: string;
    mediaUrl: string | null;
    mediaType: string | null;
    readingText: string | null;
    status: PartStatus;
}

const toPart = (row: ApiPartRow): JourneyPart => {
    const hasVideo = Boolean(row.mediaUrl);
    const hasText = Boolean(row.readingText);

    return {
        id: row.partId,
        order: row.partOrder,
        title: row.title,
        type: hasVideo && hasText ? 'both' : hasText ? 'text' : 'video',
        status: row.status,
        videoUrl: row.mediaUrl ?? undefined,
        textContent: row.readingText ?? undefined,
    };
};

/** Reverse of CONTENT_TYPE_FROM_API, for sending the filter back to the API. */
const CONTENT_TYPE_TO_API: Record<JourneyContentType, string> = {
    'sermon-series': 'sunday_service',
    'bible-study': 'bible_study',
    'devotional': 'devotional',
    'discipleship-course': 'general',
};

// ─── Category catalog ────────────────────────────────────────────────────
// content_series_categories is keyed on UUIDs, so every write that touches
// categories has to resolve names against the global catalog first. The
// catalog is admin-managed and global, so it is fetched once per session.
export interface JourneyCategoryOption {
    categoryId: string;
    name: string;
    sortOrder: number;
}

let categoryCatalog: JourneyCategoryOption[] | null = null;

export async function fetchCategoryCatalog(): Promise<JourneyCategoryOption[]> {
    if (categoryCatalog) return categoryCatalog;

    const response = await request(`${API_BASE}/api/journeys/categories`, {}, 'Failed to load categories.');
    const body = await response.json() as { categories?: JourneyCategoryOption[] };

    categoryCatalog = [...(body.categories ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
    return categoryCatalog;
}

const toCategoryIds = async (names: string[]): Promise<string[]> => {
    const catalog = await fetchCategoryCatalog();
    const idByName = new Map(catalog.map(option => [option.name.toLowerCase(), option.categoryId]));

    return names.map(name => {
        const id = idByName.get(name.toLowerCase());
        if (!id) throw new Error(`“${name}” is not a category in the catalog.`);
        return id;
    });
};

/**
 * Server-side filters accepted by GET /api/journeys. Every field is optional;
 * omitted fields mean "no restriction". Note the API takes a single `status`,
 * so a multi-select status filter has to be narrowed client-side instead.
 */
export interface JourneyQuery {
    search?: string;
    status?: JourneyStatus;
    contentType?: JourneyContentType;
    category?: string;
}

/** Standalone so the mutations below can re-read a journey without referencing the service object mid-definition. */
const fetchJourneyDetail = async (journeyId: string): Promise<Journey> => {
    const response = await request(`${API_BASE}/api/journeys/${journeyId}`, {}, 'Failed to load the journey.');
    const body = await response.json() as { journey: ApiJourneyRow; parts: ApiPartRow[] };

    return {
        ...toJourney(body.journey),
        parts: (body.parts ?? []).map(toPart).sort((a, b) => a.order - b.order),
    };
};

// ─── Journey (Series) persistence ────────────────────────────────────────
export const AdminContentService = {
    /** Reads live journeys from the API. Every other method below is still localStorage. */
    fetchJourneys: async (query: JourneyQuery = {}): Promise<Journey[]> => {
        const params = new URLSearchParams({ limit: '50' });

        if (query.search) params.set('search', query.search);
        if (query.status) params.set('status', query.status);
        if (query.contentType) params.set('content_type', CONTENT_TYPE_TO_API[query.contentType]);
        if (query.category) params.set('category', query.category);

        const response = await authFetch(`${API_BASE}/api/journeys/discover?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch journeys (${response.status})`);
        }

        const body = await response.json() as { journeys: ApiJourneyRow[] };
        return (body.journeys ?? []).map(toJourney);
    },

    fetchJourneyDetail,

    /**
     * Creating a journey is a separate flow (POST /api/journeys, then a POST
     * per Part) and is not wired up yet. Failing loudly beats the old
     * localStorage write, which appeared to succeed and then vanished on the
     * next refetch because the list reads from the API.
     */
    createJourney: async (_form: JourneyFormData): Promise<Journey> => {
        void _form;
        throw new Error('Creating a journey is not connected to the API yet.');
    },

    /**
     * Persists everything the editor stages locally, in the order the API
     * requires: metadata first, then per-Part status changes, then the new
     * Part order, and only then the Journey's own publish/archive. Publishing
     * last matters because the API refuses to publish a Journey with no
     * published Part, so the Part toggles have to land first.
     *
     * `nextStatus` undefined means "leave the lifecycle alone", which is the
     * edit-flow rule. 'draft' is also a no-op: there is no endpoint that
     * moves a Journey back to draft.
     */
    saveJourney: async (
        id: string,
        form: JourneyFormData,
        parts: JourneyPart[],
        nextStatus?: JourneyStatus,
        originalParts: JourneyPart[] = [],
    ): Promise<Journey> => {
        const categoryIds = await toCategoryIds(form.categories);

        await patchJson(`${API_BASE}/api/journeys/${id}`, {
            title: form.title.trim(),
            description: form.description.trim(),
            summary: form.summary.trim() || null,
            content_type: CONTENT_TYPE_TO_API[form.contentType],
            category_ids: categoryIds,
        }, 'Failed to save the journey.');

        const originalById = new Map(originalParts.map(part => [part.id, part]));

        for (const part of parts) {
            const before = originalById.get(part.id);
            if (!before || before.status === part.status) continue;

            if (part.status === 'archived') {
                await request(
                    `${API_BASE}/api/journeys/${id}/parts/${part.id}/archive`,
                    { method: 'PATCH' },
                    `Failed to archive “${part.title}”.`,
                );
            } else {
                await patchJson(
                    `${API_BASE}/api/journeys/${id}/parts/${part.id}/publish`,
                    { status: part.status },
                    `Failed to update “${part.title}”.`,
                );
            }
        }

        // The API needs a complete permutation, so this only fires when the
        // editor is working from the full server-loaded set.
        const orderChanged = parts.map(part => part.id).join(',') !== originalParts.map(part => part.id).join(',');
        if (orderChanged && parts.length === originalParts.length) {
            await patchJson(
                `${API_BASE}/api/journeys/${id}/parts/reorder`,
                { orderedPartIds: parts.map(part => part.id) },
                'Failed to save the new part order.',
            );
        }

        if (nextStatus === 'published') {
            await request(`${API_BASE}/api/journeys/${id}/publish`, { method: 'PATCH' }, 'Failed to publish the journey.');
        } else if (nextStatus === 'archived') {
            await request(`${API_BASE}/api/journeys/${id}/archive`, { method: 'PATCH' }, 'Failed to archive the journey.');
        }

        return fetchJourneyDetail(id);
    },

    /**
     * Quick lifecycle transition for the list view's Archive/Restore actions.
     * Restoring an archived Journey can only go to published — the API has no
     * transition back to draft — and publish still requires a published Part,
     * so an empty archived Journey will refuse with the API's own message.
     */
    setStatus: async (id: string, status: JourneyStatus): Promise<Journey> => {
        if (status === 'draft') {
            throw new Error('A journey cannot be moved back to draft. Archive it instead.');
        }

        const path = status === 'archived' ? 'archive' : 'publish';
        await request(
            `${API_BASE}/api/journeys/${id}/${path}`,
            { method: 'PATCH' },
            status === 'archived' ? 'Failed to archive the journey.' : 'Failed to publish the journey.',
        );

        return fetchJourneyDetail(id);
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
