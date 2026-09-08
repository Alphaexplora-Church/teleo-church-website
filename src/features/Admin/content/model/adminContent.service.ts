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
    thumbnailUrl: string | null;
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
    thumbnailUrl: row.thumbnailUrl ?? null,
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
        // An empty Draft placeholder has no media and no text. Calling it a
        // video Part would flag it as a broken link it never had, so the
        // video type is only claimed when there is actually a URL.
        type: hasVideo && hasText ? 'both' : hasVideo ? 'video' : 'text',
        status: row.status,
        videoUrl: row.mediaUrl ?? undefined,
        textContent: row.readingText ?? undefined,
    };
};

/**
 * The API stores the media URL but not its title or thumbnail, which come
 * from the provider's oEmbed endpoint. Without this every saved video Part
 * reloads looking unverified and has to be re-checked by hand before it can
 * be published. Failures are left as-is so a genuinely broken link still
 * reports itself.
 */
const withVideoPreviews = async (parts: JourneyPart[]): Promise<JourneyPart[]> =>
    Promise.all(parts.map(async part => {
        if (!part.videoUrl) return part;

        const preview = await validateVideoLink(part.videoUrl);
        if (!preview) return part;

        return { ...part, videoTitle: preview.title, videoThumbnail: preview.thumbnail };
    }));

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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A locally staged Part carries a client-side id until the API assigns a real one. */
const isPersisted = (partId: string) => UUID_RE.test(partId);

const mediaTypeFor = (url?: string): string | null => {
    if (!url) return null;
    if (YOUTUBE_RE.test(url)) return 'youtube';
    if (VIMEO_RE.test(url)) return 'vimeo';
    return null;
};

const partContentBody = (part: JourneyPart) => ({
    title: part.title,
    media_url: part.videoUrl?.trim() || null,
    media_type: mediaTypeFor(part.videoUrl),
    reading_text: part.textContent?.trim() || null,
});

const hasSameContent = (a: JourneyPart, b: JourneyPart) =>
    a.title === b.title
    && (a.videoUrl ?? '') === (b.videoUrl ?? '')
    && (a.textContent ?? '') === (b.textContent ?? '');

/**
 * Reconciles the editor's staged Parts against what the server holds, and
 * returns the Part ids in display order once every one of them is real.
 *
 * Creation is two calls on purpose: POST accepts only a title (a Draft Part
 * is allowed to be an empty placeholder) and PUT fills in the content, which
 * is the two-step authoring flow the API is built around. part_order is
 * assigned server-side as max + 1, so a Part staged in the middle lands at
 * the end and the reorder call afterwards puts it where the user dropped it.
 */
const syncParts = async (
    journeyId: string,
    parts: JourneyPart[],
    originalParts: JourneyPart[],
): Promise<string[]> => {
    const originalById = new Map(originalParts.map(part => [part.id, part]));
    const resolvedIds: string[] = [];

    for (const part of parts) {
        const before = originalById.get(part.id);

        if (!before || !isPersisted(part.id)) {
            const created = await request(`${API_BASE}/api/journeys/${journeyId}/parts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: part.title }),
            }, `Failed to add “${part.title}”.`);

            const { partId } = await created.json() as { partId: string };
            resolvedIds.push(partId);

            if (part.videoUrl || part.textContent) {
                await request(`${API_BASE}/api/journeys/${journeyId}/parts/${partId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(partContentBody(part)),
                }, `Failed to save “${part.title}”.`);
            }

            if (part.status !== 'draft') {
                await patchJson(
                    `${API_BASE}/api/journeys/${journeyId}/parts/${partId}/publish`,
                    { status: part.status },
                    `Failed to publish “${part.title}”.`,
                );
            }

            continue;
        }

        resolvedIds.push(part.id);

        if (!hasSameContent(before, part)) {
            await request(`${API_BASE}/api/journeys/${journeyId}/parts/${part.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(partContentBody(part)),
            }, `Failed to save “${part.title}”.`);
        }

        if (before.status !== part.status) {
            if (part.status === 'archived') {
                await request(
                    `${API_BASE}/api/journeys/${journeyId}/parts/${part.id}/archive`,
                    { method: 'PATCH' },
                    `Failed to archive “${part.title}”.`,
                );
            } else {
                await patchJson(
                    `${API_BASE}/api/journeys/${journeyId}/parts/${part.id}/publish`,
                    { status: part.status },
                    `Failed to update “${part.title}”.`,
                );
            }
        }
    }

    return resolvedIds;
};

/** Standalone so the mutations below can re-read a journey without referencing the service object mid-definition. */
const fetchJourneyDetail = async (journeyId: string): Promise<Journey> => {
    const response = await request(`${API_BASE}/api/journeys/${journeyId}`, {}, 'Failed to load the journey.');
    const body = await response.json() as { journey: ApiJourneyRow; parts: ApiPartRow[] };

    const parts = (body.parts ?? []).map(toPart).sort((a, b) => a.order - b.order);

    return {
        ...toJourney(body.journey),
        parts: await withVideoPreviews(parts),
    };
};

const journeyBody = (form: JourneyFormData, categoryIds: string[], file?: File | null) => {
    const title = form.title.trim();
    const description = form.description.trim();
    const summary = form.summary.trim();
    const contentType = CONTENT_TYPE_TO_API[form.contentType];

    if (!file) {
        return {
            headers: { 'Content-Type': 'application/json' } as Record<string, string> | undefined,
            body: JSON.stringify({
                title,
                description,
                summary: summary || null,
                content_type: contentType,
                category_ids: categoryIds,
            }) as BodyInit,
        };
    }

    const data = new FormData();
    data.append('title', title);
    data.append('description', description);
    data.append('summary', summary);
    data.append('content_type', contentType);
    data.append('category_ids', categoryIds.join(','));
    data.append('image', file);

    return { headers: undefined as Record<string, string> | undefined, body: data as BodyInit };
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
     * Phase 1 of the builder: creates the Journey shell, then its Parts, then
     * publishes if the Pastor asked for that. The Journey is always born a
     * draft server-side, so publishing is a second call and it will refuse
     * unless at least one Part came out published.
     */
    createJourney: async (
        form: JourneyFormData,
        parts: JourneyPart[] = [],
        nextStatus?: JourneyStatus,
        thumbnailFile?: File | null,
    ): Promise<Journey> => {
        const categoryIds = await toCategoryIds(form.categories);
        const { headers, body } = journeyBody(form, categoryIds, thumbnailFile);

        const created = await request(`${API_BASE}/api/journeys`, {
            method: 'POST',
            headers,
            body,
        }, 'Failed to create the journey.');

        const { journeyId } = await created.json() as { journeyId: string };

        const orderedIds = await syncParts(journeyId, parts, []);

        // Parts are appended in creation order, so this only matters when the
        // builder staged them out of order.
        if (orderedIds.length > 1) {
            await patchJson(
                `${API_BASE}/api/journeys/${journeyId}/parts/reorder`,
                { orderedPartIds: orderedIds },
                'Failed to save the part order.',
            );
        }

        if (nextStatus === 'published') {
            await request(`${API_BASE}/api/journeys/${journeyId}/publish`, { method: 'PATCH' }, 'Failed to publish the journey.');
        }

        return fetchJourneyDetail(journeyId);
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
        thumbnailFile?: File | null,
    ): Promise<Journey> => {
        const categoryIds = await toCategoryIds(form.categories);
        const { headers, body } = journeyBody(form, categoryIds, thumbnailFile);

        await request(`${API_BASE}/api/journeys/${id}`, {
            method: 'PATCH',
            headers,
            body,
        }, 'Failed to save the journey.');

        const orderedIds = await syncParts(id, parts, originalParts);

        // The API needs a complete permutation of the Journey's Parts, which
        // only holds once every staged Part has a real id.
        const serverOrder = originalParts.map(part => part.id).join(',');
        if (orderedIds.join(',') !== serverOrder && orderedIds.length >= originalParts.length) {
            await patchJson(
                `${API_BASE}/api/journeys/${id}/parts/reorder`,
                { orderedPartIds: orderedIds },
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
