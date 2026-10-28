import { Layers } from "lucide-react";
import type { JourneyPart } from "../../models/types/adminContent.types";
import { ContentNewJourneyModalSeriesCard } from "./ContentNewJourneyModalSeriesCard";

export interface ContentNewJourneyModalSeriesPartsProps {
  parts: JourneyPart[];
  onAddPart: () => void;
  onEditPart: (part: JourneyPart) => void;
  onDeletePart: (partId: string) => void;
  className?: string;
  disabled?: boolean;
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
          {parts.map((part, index) => (
            <ContentNewJourneyModalSeriesCard
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
