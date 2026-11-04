import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { ChevronDown, FileText, Image as ImageIcon } from "lucide-react";
import {
  Dropdown,
  type DropdownOption,
} from "../../../../../shared/components/Dropdown/Dropdown";
import {
  DEFAULT_JOURNEY_CATEGORIES,
  DEFAULT_JOURNEY_CONTENT_TYPES,
} from "../../models/constants/adminContent.constants";
import type {
  JourneyCategoryOption,
  JourneyContentType,
} from "../../models/types/adminContent.types";

// ─── Sub-Component: Content Type Dropdown ────────────────────────────────────
interface ContentTypeDropdownProps {
  value: JourneyContentType;
  onChange: (type: JourneyContentType) => void;
  disabled?: boolean;
}

function ContentTypeDropdown({
  value,
  onChange,
  disabled = false,
}: ContentTypeDropdownProps) {
  const selectedLabel = useMemo(() => {
    const match = DEFAULT_JOURNEY_CONTENT_TYPES.find((opt) => opt.value === value);
    return match ? match.label : "Select type";
  }, [value]);

  const dropdownItems = useMemo<DropdownOption<JourneyContentType>[]>(() => {
    return DEFAULT_JOURNEY_CONTENT_TYPES.map((opt) => ({
      id: opt.value,
      label: (
        <span
          className={
            opt.value === value ? "font-semibold text-primary" : "text-slate-700"
          }
        >
          {opt.label}
        </span>
      ),
      onClick: () => onChange(opt.value),
    }));
  }, [value, onChange]);

  return (
    <Dropdown
      items={dropdownItems}
      closeOnSelect={true}
      width="w-full"
      className="w-full"
      trigger={(isOpen) => (
        <button
          type="button"
          disabled={disabled}
          className="flex h-[42px] w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-2xs transition-all hover:border-slate-300 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 select-none cursor-pointer"
        >
          <span className="truncate uppercase tracking-wide">
            {selectedLabel}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 stroke-[2] text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      )}
    />
  );
}

// ─── Sub-Component: Categories Multi-Select ──────────────────────────────────
interface CategoriesSelectProps {
  categories: readonly string[] | string[];
  selectedCategories: string[];
  onToggleCategory?: (category: string) => void;
  onChange?: (categories: string[]) => void;
}

function CategoriesSelect({
  categories,
  selectedCategories,
  onToggleCategory,
  onChange,
}: CategoriesSelectProps) {
  const handleToggle = (cat: string) => {
    onToggleCategory?.(cat);
    if (onChange) {
      const exists = selectedCategories.some(
        (c) => c.toLowerCase() === cat.toLowerCase(),
      );
      const next = exists
        ? selectedCategories.filter(
            (c) => c.toLowerCase() !== cat.toLowerCase(),
          )
        : [...selectedCategories, cat];
      onChange(next);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1">
        <label className="text-xs font-semibold text-slate-700">Categories</label>
        <span className="text-slate-400 font-normal text-[11px]">
          (Select at least one)
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5">
        {categories.map((category) => {
          const isSelected = selectedCategories.some(
            (c) => c.toLowerCase() === category.toLowerCase(),
          );

          return (
            <button
              key={category}
              type="button"
              onClick={() => handleToggle(category)}
              className={
                isSelected
                  ? "bg-primary text-white border-transparent px-3 py-1 rounded-lg sm:rounded-xl text-xs font-medium shadow-xs transition cursor-pointer select-none"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1 rounded-lg sm:rounded-xl text-xs font-medium transition cursor-pointer select-none"
              }
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sub-Component: Image Upload Dropzone ────────────────────────────────────
interface UploadImageProps {
  previewUrl?: string | null;
  file?: File | null;
  onFileSelect?: (file: File | null) => void;
  disabled?: boolean;
}

function UploadImage({
  previewUrl,
  file,
  onFileSelect,
  disabled = false,
}: UploadImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const activePreview = previewUrl || localPreview;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    if (selected) {
      const url = URL.createObjectURL(selected);
      setLocalPreview(url);
      onFileSelect?.(selected);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(droppedFile);
      setLocalPreview(url);
      onFileSelect?.(droppedFile);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`p-3 sm:p-4 rounded-xl border border-dashed transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-slate-200 bg-slate-50/50"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden">
          {activePreview ? (
            <img
              src={activePreview}
              alt="Thumbnail preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-5 h-5 text-slate-400 stroke-[1.5]" />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-800 truncate">
            {file ? file.name : "Drag & drop thumbnail or browse files"}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            PNG, JPG, or WEBP up to 5MB · 1200×800px recommended
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          if (!disabled) fileInputRef.current?.click();
        }}
        disabled={disabled}
        className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-xs transition shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none text-center"
      >
        Browse Image
      </button>
    </div>
  );
}

// ─── Main Metadata Section Component ─────────────────────────────────────────
export interface ContentNewJourneyModalMetadataProps {
  title?: string;
  onTitleChange?: (title: string) => void;
  contentType?: JourneyContentType;
  onContentTypeChange?: (type: JourneyContentType) => void;
  categoryOptions?: JourneyCategoryOption[];
  availableCategories?: readonly string[] | string[];
  selectedCategories?: string[];
  onToggleCategory?: (category: string) => void;
  onCategoriesChange?: (categories: string[]) => void;
  summary?: string;
  onSummaryChange?: (summary: string) => void;
  description?: string;
  onDescriptionChange?: (description: string) => void;
  thumbnailFile?: File | null;
  thumbnailPreview?: string | null;
  onThumbnailChange?: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
}

export function ContentNewJourneyModalMetadata({
  title = "",
  onTitleChange,
  contentType = "sermon-series",
  onContentTypeChange,
  categoryOptions = [],
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
  const displayedCategories = useMemo(() => {
    const list: string[] = [];
    const seen = new Set<string>();

    if (categoryOptions && categoryOptions.length > 0) {
      for (const opt of categoryOptions) {
        const lower = opt.name.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          list.push(opt.name);
        }
      }
    } else if (availableCategories && availableCategories.length > 0) {
      for (const cat of availableCategories) {
        const lower = cat.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          list.push(cat);
        }
      }
    } else {
      for (const cat of DEFAULT_JOURNEY_CATEGORIES) {
        const lower = cat.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          list.push(cat);
        }
      }
    }

    // Always include any currently selected categories so they are guaranteed to appear
    for (const cat of selectedCategories) {
      const lower = cat.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        list.push(cat);
      }
    }

    return list;
  }, [categoryOptions, availableCategories, selectedCategories]);

  return (
    <section
      aria-label="Journey Details & Metadata"
      className={`bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-6 shadow-xs space-y-4 sm:space-y-5 ${className}`.trim()}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-slate-500 stroke-[2]" />
        <h2 className="text-sm font-bold text-slate-900">
          Journey Details & Metadata
        </h2>
      </div>

      {/* Row 1: Title + Content Type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <div className="md:col-span-1 space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center">
            Content Type <span className="text-red-500 ml-0.5">*</span>
          </label>
          <ContentTypeDropdown
            value={contentType}
            onChange={(val) => onContentTypeChange?.(val)}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Row 2: Categories Multi-Select */}
      <CategoriesSelect
        categories={displayedCategories}
        selectedCategories={selectedCategories}
        onToggleCategory={onToggleCategory}
        onChange={onCategoriesChange}
      />

      {/* Row 3: Short Summary */}
      <div className="space-y-1.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
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

      {/* Row 4: Full Description */}
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

      {/* Row 5: Cover Image */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">
          Cover Image / Thumbnail
        </label>
        <UploadImage
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
