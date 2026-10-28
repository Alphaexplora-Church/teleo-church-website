import { FileText } from "lucide-react";
import type { JourneyContentType } from "../../models/types/adminContent.types";
import {
  ContentNewJourneyModalCategories,
  DEFAULT_JOURNEY_CATEGORIES,
} from "./ContentNewJourneyModalCategories";
import {
  ContentNewJourneyModalDropdown,
  DEFAULT_JOURNEY_CONTENT_TYPES,
} from "./ContentNewJourneyModalDropdown";
import { ContentNewJourneyModalUploadImage } from "./ContentNewJourneyModalUploadImage";

export interface ContentNewJourneyModalMetadataProps {
  /** Title field value */
  title?: string;
  /** Title change handler */
  onTitleChange?: (title: string) => void;

  /** Content type value */
  contentType?: JourneyContentType;
  /** Content type change handler */
  onContentTypeChange?: (type: JourneyContentType) => void;

  /** List of available categories */
  availableCategories?: readonly string[] | string[];
  /** Selected category names */
  selectedCategories?: string[];
  /** Toggle category handler */
  onToggleCategory?: (category: string) => void;
  /** Full categories change handler */
  onCategoriesChange?: (categories: string[]) => void;

  /** Short summary / teaser */
  summary?: string;
  /** Summary change handler */
  onSummaryChange?: (summary: string) => void;

  /** Full description / pastoral objective */
  description?: string;
  /** Description change handler */
  onDescriptionChange?: (description: string) => void;

  /** Selected thumbnail image file */
  thumbnailFile?: File | null;
  /** Preview URL for the thumbnail image */
  thumbnailPreview?: string | null;
  /** Thumbnail file change handler */
  onThumbnailChange?: (file: File | null) => void;

  /** Disabled state */
  disabled?: boolean;
  /** Custom container class names */
  className?: string;
}

export function ContentNewJourneyModalMetadata({
  title = "",
  onTitleChange,
  contentType = "sermon-series",
  onContentTypeChange,
  availableCategories = DEFAULT_JOURNEY_CATEGORIES,
  selectedCategories = [],
  onToggleCategory,
  onCategoriesChange,
  summary = "",
  onSummaryChange,
  description = "",
  onDescriptionChange,
  thumbnailFile = null,
  thumbnailPreview = null,
  onThumbnailChange,
  disabled = false,
  className = "",
}: ContentNewJourneyModalMetadataProps) {
  return (
    <section
      aria-label="Journey Details & Metadata"
      className={`bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5 ${className}`.trim()}
    >
      {/* Header: Card title with icon */}
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-slate-500 stroke-[2]" />
        <h2 className="text-sm font-bold text-slate-900">
          Journey Details & Metadata
        </h2>
      </div>

      {/* Row 1 (Title + Content Type): Grid 1 col on mobile, 3 cols on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: Journey Title * */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center">
            Journey Title <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            disabled={disabled}
            placeholder="e.g. Rooted: A Journey Through Colossians"
            className="h-[42px] w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal shadow-2xs transition-all hover:border-slate-300 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Right: Content Type * */}
        <div className="md:col-span-1 space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center">
            Content Type <span className="text-red-500 ml-0.5">*</span>
          </label>
          <ContentNewJourneyModalDropdown
            value={contentType}
            onChange={(val) => onContentTypeChange?.(val as JourneyContentType)}
            options={DEFAULT_JOURNEY_CONTENT_TYPES}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Row 2: Categories Multi-Select */}
      <ContentNewJourneyModalCategories
        categories={availableCategories}
        selectedCategories={selectedCategories}
        onToggleCategory={onToggleCategory}
        onChange={onCategoriesChange}
      />

      {/* Row 3: Short Summary / Teaser */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">
            Short Summary / Teaser
          </label>
          <span className="text-[11px] text-slate-400 font-normal">
            Shown on listing cards (Recommended: 80-120 characters)
          </span>
        </div>
        <input
          type="text"
          value={summary}
          onChange={(e) => onSummaryChange?.(e.target.value)}
          disabled={disabled}
          placeholder="e.g. A 6-week core pathway introducing prayer habits and scriptural literacy."
          className="h-[42px] w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal shadow-2xs transition-all hover:border-slate-300 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Row 4: Full Description & Pastoral Objective */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">
          Full Description & Pastoral Objective
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => onDescriptionChange?.(e.target.value)}
          disabled={disabled}
          placeholder="Detailed breakdown of curriculum focus, objectives, and reflection themes..."
          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal shadow-2xs transition-all hover:border-slate-300 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
      </div>

      {/* Row 5: Cover Image / Thumbnail */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">
          Cover Image / Thumbnail
        </label>
        <ContentNewJourneyModalUploadImage
          file={thumbnailFile}
          previewUrl={thumbnailPreview}
          onFileSelect={onThumbnailChange}
          disabled={disabled}
        />
      </div>
    </section>
  );
}

export default ContentNewJourneyModalMetadata;
