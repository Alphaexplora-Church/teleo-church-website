import { useState, useRef } from "react";
import { Layers, MoreVertical } from "lucide-react";
import type {
  JourneyPart,
  PartContentType,
  PartStatus,
} from "../../models/types/adminContent.types";
import { ContentJourneyListDropdown } from "../ContentJourneyList/ContentJourneyListDropdown";

// ─── Sub-Component: Single Series Part Card ──────────────────────────────────
interface SeriesPartCardProps {
  part: JourneyPart;
  index: number;
  onEditPart: (part: JourneyPart) => void;
  onDeletePart: (partId: string) => void;
  disabled?: boolean;
}

function formatPartTypeBadge(type: PartContentType): string {
  switch (type) {
    case "video":
      return "VIDEO LESSON";
    case "text":
      return "READING PASSAGE";
    case "both":
      return "LESSON & READING";
    default:
      return "LESSON";
  }
}

function getPartStatusBadgeClasses(status: PartStatus): string {
  switch (status) {
    case "published":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200/60";
    case "draft":
      return "bg-amber-50 text-amber-700 border border-amber-200/60";
    case "archived":
      return "bg-slate-100 text-slate-600 border border-slate-200/60";
    default:
      return "bg-slate-100 text-slate-600 border border-slate-200/60";
  }
}

function SeriesPartCard({
  part,
  index,
  onEditPart,
  onDeletePart,
  disabled = false,
}: SeriesPartCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const displayOrder = part.order || index + 1;

  return (
    <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-colors shadow-2xs relative">
      {/* Left side: Order number, thumbnail (if any), title, and badges */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
          {displayOrder}
        </span>

        {part.videoThumbnail && (
          <img
            src={part.videoThumbnail}
            alt=""
            className="w-14 h-9 sm:w-16 sm:h-10 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0"
          />
        )}

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-900 truncate">
            {part.title}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
              {formatPartTypeBadge(part.type)}
            </span>

            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getPartStatusBadgeClasses(
                part.status,
              )}`}
            >
              {part.status}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: 3-dots action trigger + dropdown */}
      <div className="relative shrink-0">
        <button
          ref={buttonRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsDropdownOpen((prev) => !prev);
          }}
          disabled={disabled}
          aria-label="Part actions"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        <ContentJourneyListDropdown
          isOpen={isDropdownOpen}
          triggerRef={buttonRef}
          onClose={() => setIsDropdownOpen(false)}
          onEdit={() => onEditPart(part)}
          onDelete={() => onDeletePart(part.id)}
        />
      </div>
    </div>
  );
}

// ─── Main Series Parts Component ─────────────────────────────────────────────
export interface ContentNewJourneyModalSeriesPartsProps {
  parts: JourneyPart[];
  onAddPart: () => void;
  onEditPart: (part: JourneyPart) => void;
  onDeletePart: (partId: string) => void;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ContentNewJourneyModalSeriesParts({
  parts = [],
  onAddPart,
  onEditPart,
  onDeletePart,
  className = "",
  disabled = false,
  isLoading = false,
}: ContentNewJourneyModalSeriesPartsProps) {
  return (
    <section
      aria-label="Series Parts"
      className={`space-y-3 ${className}`.trim()}
    >
      {/* 1. Header Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">
            Series Parts <span className="text-red-500">*</span>
          </span>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
            {isLoading
              ? "Loading parts..."
              : `${parts.length} ${parts.length === 1 ? "part configured" : "parts configured"}`}
          </span>
        </div>

        <button
          type="button"
          onClick={onAddPart}
          disabled={disabled || isLoading}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition shadow-xs cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add Part
        </button>
      </div>

      {/* 2. Loading Skeleton View */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/60 bg-slate-50/50 animate-pulse"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-6 h-6 rounded-lg bg-slate-200 shrink-0" />
                <div className="w-14 h-9 sm:w-16 sm:h-10 rounded-lg bg-slate-200 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-slate-200 rounded-md w-1/3" />
                  <div className="h-3 bg-slate-200 rounded-md w-1/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : parts.length === 0 ? (
        /* 3. Empty State View */
        <div className="border border-dashed border-slate-200 rounded-2xl py-10 px-4 flex flex-col items-center justify-center text-center bg-white shadow-2xs">
          <Layers className="w-8 h-8 text-slate-400 mb-2 stroke-[1.5]" />
          <h3 className="text-sm font-semibold text-slate-800">No parts yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
            Add your first lesson, sermon, or reading passage to build this
            series.
          </p>
        </div>
      ) : (
        /* 4. Configured Parts List View */
        <div className="space-y-2">
          {parts.map((part, index) => (
            <SeriesPartCard
              key={part.id}
              part={part}
              index={index}
              onEditPart={onEditPart}
              onDeletePart={onDeletePart}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ContentNewJourneyModalSeriesParts;
