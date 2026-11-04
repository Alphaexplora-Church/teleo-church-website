import type { TabOption } from "../../../../../shared/components/TabSwitch/TabSwitch";
import type {
  JourneyContentType,
  JourneyFormData,
  JourneyPart,
  JourneyStatus,
  PartContentType,
  PartFormData,
  PartStatus,
} from "../types/adminContent.types";

/**
 * Standard topical category options for Journeys.
 */
export const JOURNEY_CATEGORIES = [
  "Spiritual Formation",
  "Core Pathways",
  "Theology & Doctrine",
  "Community & Fellowship",
  "Prayer & Fasting",
] as const;

export const DEFAULT_JOURNEY_CATEGORIES = JOURNEY_CATEGORIES;

/**
 * Overall format options of a journey.
 */
export const CONTENT_TYPE_OPTIONS: readonly {
  value: JourneyContentType;
  label: string;
}[] = [
  { value: "sermon-series", label: "Sermon Series" },
  { value: "bible-study", label: "Bible Study" },
  { value: "devotional", label: "Devotional Plan" },
  { value: "discipleship-course", label: "Discipleship Course" },
] as const;

/**
 * Dropdown options formatted for ContentNewJourneyModalDropdown.
 */
export const JOURNEY_CONTENT_TYPE_DROPDOWN_OPTIONS: readonly {
  value: JourneyContentType;
  label: string;
}[] = [
  { value: "sermon-series", label: "SERMON SERIES" },
  { value: "bible-study", label: "BIBLE STUDY" },
  { value: "devotional", label: "DEVOTIONAL" },
  { value: "discipleship-course", label: "DISCIPLESHIP TRACK" },
] as const;

export const DEFAULT_JOURNEY_CONTENT_TYPES =
  JOURNEY_CONTENT_TYPE_DROPDOWN_OPTIONS;

/**
 * Display labels for journey card content types.
 */
export const CONTENT_TYPE_DISPLAY: Record<JourneyContentType, string> = {
  "discipleship-course": "DISCIPLESHIP TRACK",
  "bible-study": "BIBLE STUDY",
  "sermon-series": "SERMON SERIES",
  devotional: "DEVOTIONAL",
};

/**
 * Part Status options for dropdown selector in AddPartsModal.
 */
export const PART_STATUS_DROPDOWN_OPTIONS: readonly {
  value: PartStatus;
  label: string;
}[] = [
  { value: "draft", label: "Draft — Hidden from members" },
  { value: "published", label: "Published — Visible when journey goes live" },
] as const;

/**
 * Tab options for switching between Part content types (Video / Passage / Both).
 */
export const PART_CONTENT_TYPE_TABS: readonly TabOption<PartContentType>[] = [
  { id: "video", label: "Video Link" },
  { id: "text", label: "Written Passage" },
  { id: "both", label: "Both" },
] as const;

export const SWITCH_TABS = PART_CONTENT_TYPE_TABS;

/**
 * Lifecycle status options for a Journey.
 */
export const STATUS_OPTIONS: readonly {
  value: JourneyStatus;
  label: string;
  description: string;
}[] = [
  { value: "draft", label: "Draft", description: "Not yet visible to members" },
  {
    value: "published",
    label: "Published",
    description: "Live and visible to members",
  },
  {
    value: "archived",
    label: "Archived",
    description: "Hidden from members but kept for reference",
  },
] as const;

/**
 * Empty / initial form shape for creating or resetting a journey.
 */
export const EMPTY_JOURNEY_FORM: JourneyFormData = {
  title: "",
  description: "",
  contentType: "sermon-series",
  categories: [],
  summary: "",
};

/**
 * Empty / initial form shape for creating or resetting a single part.
 */
export const EMPTY_PART_FORM: PartFormData = {
  title: "",
  type: "video",
  status: "draft",
  videoUrl: "",
  textContent: "",
};

/**
 * Validation: A journey may only be published if at least one Part is published.
 */
export const canPublishJourney = (parts: JourneyPart[]): boolean =>
  parts.some((part) => part.status === "published");

export const canPublishSeries = canPublishJourney;

/**
 * Validation: A series requires at least one configured part.
 */
export const hasRequiredParts = (parts: JourneyPart[]): boolean =>
  parts.length > 0;

/**
 * Generates a client-side transient unique ID.
 */
export const uid = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Builds a JourneyPart domain object from form data, preserving existing ID/order if editing.
 */
export function buildPart(
  form: PartFormData,
  existing?: JourneyPart,
  order?: number,
): JourneyPart {
  return {
    id: existing?.id ?? uid(),
    order: existing?.order ?? order ?? 1,
    title: form.title.trim(),
    type: form.type,
    status: form.status,
    videoUrl: form.type !== "text" ? form.videoUrl.trim() : undefined,
    videoTitle: form.type !== "text" ? (existing?.videoTitle ?? null) : null,
    videoThumbnail:
      form.type !== "text" ? (existing?.videoThumbnail ?? null) : null,
    textContent: form.type !== "video" ? form.textContent.trim() : undefined,
  };
}
