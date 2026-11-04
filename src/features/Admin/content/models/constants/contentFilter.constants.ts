import type { JourneyContentType } from "../types/adminContent.types";

export interface ContentFilterOption<T = string> {
  value: T;
  label: string;
}

export const CONTENT_TYPE_FILTER_OPTIONS: readonly ContentFilterOption<
  JourneyContentType | "all"
>[] = [
  { value: "all", label: "All content types" },
  { value: "sermon-series", label: "Sermon Series" },
  { value: "bible-study", label: "Bible Study" },
  { value: "devotional", label: "Devotional Plan" },
  { value: "discipleship-course", label: "Discipleship Course" },
] as const;

export const CONTENT_FILTER_DEFAULTS = {
  allValue: "all",
  contentTypePlaceholder: "All content types",
  categoryPlaceholder: "All categories",
  searchPlaceholder: "Search by title or category...",
} as const;

export interface ContentStatusOption {
  value: "draft" | "published" | "archived";
  label: string;
}

export const CONTENT_STATUS_FILTER_OPTIONS: readonly ContentStatusOption[] = [
  { value: "draft", label: "DRAFT" },
  { value: "published", label: "PUBLISHED" },
  { value: "archived", label: "ARCHIVED" },
] as const;

