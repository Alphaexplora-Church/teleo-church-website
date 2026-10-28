import { Layers, Pencil, Trash2 } from "lucide-react";
import type {
  JourneyPart,
  PartContentType,
  PartStatus,
} from "../../models/types/adminContent.types";

export interface ContentNewJourneyModalSeriesPartsProps {
  parts: JourneyPart[];
  onAddPart: () => void;
  onEditPart: (part: JourneyPart) => void;
  onDeletePart: (partId: string) => void;
  className?: string;
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

export function ContentNewJourneyModalSeriesParts({
  parts = [],
  onAddPart,
  onEditPart,
  onDeletePart,
  className = "",
  disabled = false,
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
            {parts.length}{" "}
            {parts.length === 1 ? "part configured" : "parts configured"}
          </span>
        </div>

        <button
          type="button"
          onClick={onAddPart}
          disabled={disabled}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition shadow-xs cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add Part
        </button>
      </div>

      {/* 2. Empty State View (When parts.length === 0) */}
      {parts.length === 0 ? (
        <div className="border border-dashed border-slate-200 rounded-2xl py-10 px-4 flex flex-col items-center justify-center text-center bg-white shadow-2xs">
          <Layers className="w-8 h-8 text-slate-400 mb-2 stroke-[1.5]" />
          <h3 className="text-sm font-semibold text-slate-800">No parts yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
            Add your first lesson, sermon, or reading passage to build this
            series.
          </p>
        </div>
      ) : (
        /* 3. Configured Parts List View (When parts.length > 0) */
        <div className="space-y-2">
          {parts.map((part, index) => {
            const displayOrder = part.order || index + 1;

            return (
              <div
                key={part.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-colors shadow-2xs"
              >
                {/* Left side: Order number, title, and badges */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                    {displayOrder}
                  </span>

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

                {/* Right side: Actions (Edit, Delete) */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onEditPart(part)}
                    disabled={disabled}
                    aria-label={`Edit ${part.title}`}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeletePart(part.id)}
                    disabled={disabled}
                    aria-label={`Delete ${part.title}`}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ContentNewJourneyModalSeriesParts;
