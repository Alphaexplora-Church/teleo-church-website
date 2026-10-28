import { useState } from "react";
import {
  Archive,
  BookOpen,
  CheckCircle2,
  Layers,
  Pencil,
} from "lucide-react";
import type {
  Journey,
  JourneyContentType,
  JourneyStatus,
} from "../../models/types/adminContent.types";
import { ContentJourneyListDropdown } from "./ContentJourneyListDropdown";
import { ContentJourneyListIconBtn } from "./ContentJourneyListIconBtn";

export interface ContentJourneyListCardProps {
  journey: Journey;
  onEdit: (journey: Journey) => void;
  onArchive?: (journey: Journey) => void;
  onDelete?: (journey: Journey) => void;
  className?: string;
}

const CONTENT_TYPE_DISPLAY: Record<JourneyContentType, string> = {
  "discipleship-course": "DISCIPLESHIP TRACK",
  "bible-study": "BIBLE STUDY",
  "sermon-series": "SERMON SERIES",
  devotional: "DEVOTIONAL",
};

function formatRelativeTime(dateString?: string, isDraft = false): string {
  if (!dateString) return isDraft ? "Drafted recently" : "Updated recently";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return isDraft ? "Drafted recently" : "Updated recently";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const prefix = isDraft ? "Drafted" : "Updated";

  if (diffDays <= 0) {
    if (diffHours <= 0) {
      if (diffMins <= 1) return `${prefix} just now`;
      return `${prefix} ${diffMins}m ago`;
    }
    return `${prefix} ${diffHours}h ago`;
  }
  if (diffDays === 1) return `${prefix} yesterday`;
  if (diffDays < 7) return `${prefix} ${diffDays}d ago`;
  if (diffDays < 30) return `${prefix} ${Math.floor(diffDays / 7)}w ago`;
  return `${prefix} ${date.toLocaleDateString()}`;
}

function getStatusBadgeClasses(status: JourneyStatus): string {
  switch (status) {
    case "published":
      return "bg-emerald-100/90 text-emerald-800 border border-emerald-200/60";
    case "draft":
      return "bg-amber-100/90 text-amber-900 border border-amber-200/60";
    case "archived":
      return "bg-slate-100 text-slate-700 border border-slate-200/60";
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200/60";
  }
}

export function ContentJourneyListCard({
  journey,
  onEdit,
  onArchive,
  onDelete,
  className = "",
}: ContentJourneyListCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const partsCount =
    journey.parts && journey.parts.length > 0
      ? journey.parts.length
      : ((journey as unknown as Record<string, unknown>).totalParts as number) ??
        0;

  const publishedCount =
    journey.parts && journey.parts.length > 0
      ? journey.parts.filter((p) => p.status === "published").length
      : ((journey as unknown as Record<string, unknown>)
          .totalPublishedParts as number) ?? 0;

  const contentTypeLabel =
    CONTENT_TYPE_DISPLAY[journey.contentType] ??
    journey.contentType.replace(/-/g, " ").toUpperCase();

  return (
    <article
      onClick={() => onEdit(journey)}
      className={`group relative bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between overflow-visible transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 cursor-pointer ${
        isDropdownOpen ? "z-20" : "z-0"
      } ${className}`.trim()}
    >
      {/* Top Media Banner */}
      <div className="relative w-full aspect-video rounded-t-2xl bg-slate-100 border-b border-slate-100">
        <div className="relative w-full h-full rounded-t-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
          {journey.thumbnailUrl ? (
            <img
              src={journey.thumbnailUrl}
              alt={journey.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <BookOpen className="w-8 h-8 text-slate-400 stroke-[1.5]" />
          )}
        </div>

        {/* Top-Left: Status badge pill */}
        <div
          className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wider ${getStatusBadgeClasses(
            journey.status,
          )}`}
        >
          {journey.status}
        </div>

        {/* Top-Right: 3-dot trigger button & dropdown */}
        <div
          className="absolute top-3 right-3 z-30"
          onClick={(e) => e.stopPropagation()}
        >
          <ContentJourneyListIconBtn
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen((prev) => !prev);
            }}
          />
          <ContentJourneyListDropdown
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            onEdit={() => {
              setIsDropdownOpen(false);
              onEdit(journey);
            }}
            onArchive={() => {
              setIsDropdownOpen(false);
              onArchive?.(journey);
            }}
            onDelete={() => {
              setIsDropdownOpen(false);
              onDelete?.(journey);
            }}
          />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-1.5">
          {/* Content Type */}
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {contentTypeLabel}
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-xl line-clamp-1 group-hover:text-primary transition">
            {journey.title}
          </h3>

          {/* Categories Row */}
          {journey.categories && journey.categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {journey.categories.map((category) => (
                <span
                  key={category}
                  className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2.5 py-1 rounded-md border border-slate-200/60"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Metrics Row */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>{partsCount} parts</span>
          </div>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{publishedCount} published</span>
          </div>
        </div>

        {/* Summary */}
        {(journey.summary || journey.description) && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {journey.summary || journey.description}
          </p>
        )}

        {/* Card Footer */}
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-400">
          <span>
            {formatRelativeTime(journey.updatedAt, journey.status === "draft")}
          </span>

          {journey.status === "published" ? (
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Ready</span>
            </span>
          ) : journey.status === "draft" ? (
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <Pencil className="h-3.5 w-3.5 text-slate-500" />
              <span>Draft</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-400 font-medium">
              <Archive className="h-3.5 w-3.5" />
              <span>Archived</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}