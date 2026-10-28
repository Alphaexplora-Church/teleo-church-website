import { useState, useRef } from "react";
import { MoreVertical } from "lucide-react";
import type {
  JourneyPart,
  PartContentType,
  PartStatus,
} from "../../models/types/adminContent.types";
import { ContentJourneyListDropdown } from "../ContentJourneyList/ContentJourneyListDropdown";

export interface ContentNewJourneyModalSeriesCardProps {
  part: JourneyPart;
  index: number;
  onEditPart: (part: JourneyPart) => void;
  onDeletePart: (partId: string) => void;
  disabled?: boolean;
  className?: string;
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

export function ContentNewJourneyModalSeriesCard({
  part,
  index,
  onEditPart,
  onDeletePart,
  disabled = false,
  className = "",
}: ContentNewJourneyModalSeriesCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const displayOrder = part.order || index + 1;

  return (
    <div
      className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-colors shadow-2xs relative ${className}`.trim()}
    >
      {/* Left side: Order number, thumbnail (if any), title, and badges */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Order Number */}
        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
          {displayOrder}
        </span>

        {/* Video Thumbnail (placed beside the order number) */}
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
            {/* Type Badge */}
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
              {formatPartTypeBadge(part.type)}
            </span>

            {/* Status Badge */}
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

export default ContentNewJourneyModalSeriesCard;
