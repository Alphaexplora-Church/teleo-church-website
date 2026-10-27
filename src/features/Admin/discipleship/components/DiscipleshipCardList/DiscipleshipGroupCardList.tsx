import type { ReactNode } from "react";
import { AlertCircle, RefreshCw, Users } from "lucide-react";
import {
  DiscipleshipGroupCard,
  type DiscipleshipGroupCardProps,
} from "./DiscipleshipGroupCard";
import type { DiscipleshipGroupItem } from "../../models/types/groupsScheduleDirectory.types";

export type { DiscipleshipGroupItem };

export interface DiscipleshipGroupCardListProps {
  /** Array of discipleship groups to display */
  groups?: readonly DiscipleshipGroupItem[];
  /** Total count of active groups (defaults to groups.length if not provided) */
  totalActiveCount?: number;
  /** Whether data is currently loading from API */
  isLoading?: boolean;
  /** Optional error message */
  error?: string | null;
  /** Callback to retry loading on failure */
  onRetry?: () => void;
  /** Callback triggered when the options / action button on a card is clicked */
  onCardActionClick?: (group: DiscipleshipGroupItem) => void;
  /** Callback triggered when a card is clicked */
  onCardClick?: (group: DiscipleshipGroupItem) => void;
  /** Optional custom card renderer */
  renderCard?: (
    group: DiscipleshipGroupItem,
    defaultProps: DiscipleshipGroupCardProps,
  ) => ReactNode;
  /** Message displayed when there are no groups */
  emptyMessage?: string;
  /** Optional max height for scrollable card viewport */
  maxHeight?: string;
  /** Optional wrapper container className */
  className?: string;
}

const SAMPLE_DISCIPLESHIP_GROUPS: DiscipleshipGroupItem[] = [];

export function DiscipleshipGroupCardList({
  groups = SAMPLE_DISCIPLESHIP_GROUPS,
  totalActiveCount,
  isLoading = false,
  error = null,
  onRetry,
  onCardActionClick,
  onCardClick,
  renderCard,
  emptyMessage = "No active groups found.",
  maxHeight = "max-h-[calc(100vh-390px)]",
  className = "",
}: DiscipleshipGroupCardListProps) {
  const showingCount = groups.length;
  const totalCount = totalActiveCount ?? showingCount;

  return (
    <div className={`flex flex-col gap-3.5 ${className}`.trim()}>
      {/* Error Banner with Retry */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm text-rose-800 shadow-xs backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-3 py-1 text-xs font-semibold text-rose-700 shadow-2xs transition-colors hover:bg-rose-100"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Dynamic Count (placed below toolbar, above list) */}
      {!isLoading && (
        <div className="pt-0.5 pl-1.5">
          <p className="text-xs font-normal text-slate-400">
            Showing {showingCount} of {totalCount} active groups
          </p>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid w-full grid-cols-1 gap-3 p-1 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="flex min-h-[148px] animate-pulse flex-col justify-between rounded-2xl border border-midnight-teal/10 bg-white/70 p-5 shadow-xs backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-200" />
                  <div className="h-3.5 w-24 rounded-md bg-slate-200" />
                </div>
                <div className="h-4 w-4 rounded bg-slate-200" />
              </div>

              <div className="mt-3 space-y-2">
                <div className="h-4 w-3/4 rounded-md bg-slate-200" />
                <div className="flex items-center justify-end">
                  <div className="h-3 w-16 rounded bg-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : showingCount === 0 ? (
        /* Clean Empty State */
        <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-midnight-teal/15 bg-white/60 p-8 text-center backdrop-blur-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-midnight-teal/5 text-midnight-teal/60 ring-1 ring-midnight-teal/10">
            <Users className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-midnight-teal">
              No Discipleship Groups
            </h3>
            <p className="text-xs text-midnight-teal/60 max-w-sm">
              {emptyMessage}
            </p>
          </div>
        </div>
      ) : (
        /* Scrollable Cards Grid */
        <div
          className={`overflow-y-auto overscroll-contain pr-1 sm:pr-1.5 ${maxHeight}`.trim()}
        >
          <div className="grid w-full grid-cols-1 gap-3 p-1 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
            {groups.map((group) => {
              const cardProps: DiscipleshipGroupCardProps = {
                title: group.title,
                leaderName: group.leaderName,
                leaderImageUrl: group.leaderImageUrl,
                currentSeats: group.currentSeats,
                maxSeats: group.maxSeats,
                isFull: group.isFull,
                onActionClick: onCardActionClick
                  ? () => onCardActionClick(group)
                  : undefined,
                className: onCardClick ? "cursor-pointer" : "",
              };

              if (renderCard) {
                return (
                  <div
                    key={group.id}
                    onClick={onCardClick ? () => onCardClick(group) : undefined}
                  >
                    {renderCard(group, cardProps)}
                  </div>
                );
              }

              return (
                <div
                  key={group.id}
                  onClick={onCardClick ? () => onCardClick(group) : undefined}
                >
                  <DiscipleshipGroupCard {...cardProps} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DiscipleshipGroupCardList;
