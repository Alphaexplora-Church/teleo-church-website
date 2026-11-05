// ─── Admin Content — Journeys/Series: Types (Domain Model) ───────────────────
// A "Journey" is a Series: a container of ordered Parts that a Pastor builds
// up over time (Phase 1), and can later revisit to edit (Phase 1.1).

/** Overall format of the journey, chosen at creation time. */
export type JourneyContentType =
  | "sermon-series"
  | "bible-study"
  | "devotional"
  | "discipleship-course";

/** Whether a Part carries a video link, a written passage, or both. */
export type PartContentType = "video" | "text" | "both";

/**
 * A single Part's lifecycle state. A journey may only be published once at
 * least one Part is 'published'. 'archived' hides the Part from Members
 * while keeping it intact for reference/restoration.
 */
export type PartStatus = "draft" | "published" | "archived";

/** A journey's own publish state. */
export type JourneyStatus = "draft" | "published" | "archived";

/**
 * Resolved video metadata preview from provider (YouTube, Vimeo, etc.).
 */
export interface VideoPreview {
  title: string;
  thumbnail: string;
}

/**
 * Domain representation of a single Part within a Journey series.
 */
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

/**
 * Domain representation of a complete Journey / Curriculum Series.
 */
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

/** Draft shape used while adding/editing a single Part in the Series builder. */
export interface PartFormData {
  title: string;
  type: PartContentType;
  status: PartStatus;
  videoUrl: string;
  textContent: string;
}

/** Category catalog option loaded from the backend API. */
export interface JourneyCategoryOption {
  categoryId: string;
  name: string;
  sortOrder: number;
}

/** Query parameters accepted by the fetchJourneys API. */
export interface JourneyQuery {
  search?: string;
  status?: JourneyStatus;
  contentType?: JourneyContentType;
  category?: string;
}

// Re-export constants for backwards compatibility with any existing consumer
export {
  CONTENT_TYPE_OPTIONS,
  STATUS_OPTIONS,
  EMPTY_JOURNEY_FORM,
  EMPTY_PART_FORM,
  canPublishJourney,
  canPublishSeries,
  hasRequiredParts,
} from "../constants/adminContent.constants";
