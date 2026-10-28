import {
  CONTENT_STATUS_FILTER_OPTIONS,
  type ContentStatusOption,
} from "../../models/constants/contentFilter.constants";
import type { JourneyStatus } from "../../models/types/adminContent.types";

export interface ContentFilterStatusProps {
  /** Array of active/selected status keys */
  selectedStatuses?: JourneyStatus[];
  /** Alias for selectedStatuses */
  selected?: JourneyStatus[];
  /** Toggle handler when a status pill is clicked */
  onToggleStatus?: (status: JourneyStatus) => void;
  /** Alias for onToggleStatus */
  onToggle?: (status: JourneyStatus) => void;
  /** Optional custom options list (defaults to CONTENT_STATUS_FILTER_OPTIONS) */
  options?: readonly ContentStatusOption[] | ContentStatusOption[];
  /** Optional custom container class names */
  className?: string;
  /** Optional label before the pills (e.g. "STATUS") */
  label?: string;
}

/**
 * Reusable multi-select status filter pills for Content / Journeys management.
 */
export function ContentFilterStatus({
  selectedStatuses,
  selected,
  onToggleStatus,
  onToggle,
  options = CONTENT_STATUS_FILTER_OPTIONS,
  className = "",
  label,
}: ContentFilterStatusProps) {
  const activeStatuses = selectedStatuses ?? selected ?? [];
  const handleToggle = onToggleStatus ?? onToggle ?? (() => {});

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`.trim()}>
      {label && (
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 select-none mr-1">
          {label}
        </span>
      )}

      {options.map((option) => {
        const isActive = activeStatuses.includes(option.value);

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleToggle(option.value)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              isActive
                ? "border border-primary bg-primary text-white shadow-xs hover:bg-primary/90"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-primary hover:bg-slate-50/50"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default ContentFilterStatus;