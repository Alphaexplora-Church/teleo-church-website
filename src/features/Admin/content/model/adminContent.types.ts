// ─── Admin Content — Journeys/Series: Types (Model) ─────────────────────────
// A "Journey" is a Series: a container of ordered Parts that a Pastor builds
// up over time (Phase 1), and can later revisit to edit (Phase 1.1).

/** Overall format of the journey, chosen at creation time. */
export type JourneyContentType = 'sermon-series' | 'bible-study' | 'devotional' | 'discipleship-course';

export const CONTENT_TYPE_OPTIONS: { value: JourneyContentType; label: string }[] = [
    { value: 'sermon-series', label: 'Sermon Series' },
    { value: 'bible-study', label: 'Bible Study' },
    { value: 'devotional', label: 'Devotional Plan' },
    { value: 'discipleship-course', label: 'Discipleship Course' },
];

/** Fixed topical tags a Pastor can attach to a journey. Multi-select. */
// Categories are an admin-managed global catalog keyed on UUIDs, loaded at
// runtime from GET /api/journeys/categories. A journey carries their names.

/** Whether a Part carries a video link, a written passage, or both. */
export type PartContentType = 'video' | 'text' | 'both';

/**
 * A single Part's lifecycle state. A journey may only be published once at
 * least one Part is 'published'. 'archived' hides the Part from Members
 * (and from the publish-eligibility check below) while keeping it — and any
 * Member completion record tied to it — intact for reference/restoration.
 */
export type PartStatus = 'draft' | 'published' | 'archived';

/** A journey's own publish state — hidden from members while draft, visible once published, hidden again (but retained) once archived. */
export type JourneyStatus = 'draft' | 'published' | 'archived';

export const STATUS_OPTIONS: { value: JourneyStatus; label: string; description: string }[] = [
    { value: 'draft', label: 'Draft', description: 'Not yet visible to members' },
    { value: 'published', label: 'Published', description: 'Live and visible to members' },
    { value: 'archived', label: 'Archived', description: 'Hidden from members but kept for reference' },
];

export interface JourneyPart {
    id: string;
    /** 1-based position within the series; determines playback/reading order. */
    order: number;
    title: string;
    type: PartContentType;
    status: PartStatus;
    videoUrl?: string;
    /** Populated by link validation — cleared whenever the URL changes until re-validated. */
    videoTitle?: string | null;
    videoThumbnail?: string | null;
    textContent?: string;
}

export interface Journey {
    id: string;
    title: string;
    description: string;
    contentType: JourneyContentType;
    categories: string[];
    /** Optional short teaser shown in listings; falls back to a trimmed description if omitted. */
    summary?: string;
    thumbnailUrl?: string | null;
    parts: JourneyPart[];
    status: JourneyStatus;
    createdAt: string;
    updatedAt: string;
}

/** Metadata-only form shape used by the Journey creation/edit form. */
export interface JourneyFormData {
    title: string;
    description: string;
    contentType: JourneyContentType;
    categories: string[];
    summary: string;
}

export const EMPTY_JOURNEY_FORM: JourneyFormData = {
    title: '',
    description: '',
    contentType: 'sermon-series',
    categories: [],
    summary: '',
};

/** Draft shape used while adding/editing a single Part in the Series builder. */
export interface PartFormData {
    title: string;
    type: PartContentType;
    status: PartStatus;
    videoUrl: string;
    textContent: string;
}

export const EMPTY_PART_FORM: PartFormData = {
    title: '',
    type: 'video',
    status: 'draft',
    videoUrl: '',
    textContent: '',
};

/** A journey may be published only once it has at least one Published Part. */
export const canPublishJourney = (parts: JourneyPart[]): boolean =>
    parts.some(part => part.status === 'published');
