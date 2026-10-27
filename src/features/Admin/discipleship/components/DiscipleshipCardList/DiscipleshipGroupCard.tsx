import type { ReactNode } from "react";
import { MoreVertical, Users } from "lucide-react";

export interface DiscipleshipGroupCardProps {
  /** Name of the discipleship group (e.g. "The Fig Tree Group") */
  title?: string;
  /** Name of the group leader/discipler (e.g. "Mark Reyes") */
  leaderName?: string;
  /** Alias for leaderName */
  disciplerName?: string;
  /** Optional URL for the leader's avatar image */
  leaderImageUrl?: string;
  /** Current number of enrolled members */
  currentSeats?: number;
  /** Maximum seating capacity */
  maxSeats?: number;
  /** Explicit override for whether the group is full (defaults to currentSeats >= maxSeats) */
  isFull?: boolean;
  /** Optional custom action element (e.g. menu dropdown) */
  action?: ReactNode;
  /** Optional callback when the kebab/options button is clicked */
  onActionClick?: () => void;
  /** Optional container className for additional styling */
  className?: string;
}

export function DiscipleshipGroupCard({
  title = "",
  leaderName = "",
  disciplerName,
  leaderImageUrl,
  currentSeats = 0,
  maxSeats = 0,
  isFull: isFullProp,
  action,
  onActionClick,
  className = "",

}: DiscipleshipGroupCardProps) {
  const displayLeaderName = disciplerName ?? leaderName;

  const isFull =
    isFullProp ??
    (typeof currentSeats === "number" &&
      typeof maxSeats === "number" &&
      currentSeats >= maxSeats);

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:border-midnight-teal/20 hover:shadow-md ${className}`.trim()}
    >
      {/* Top Header: Discipler Avatar + Discipler Name + Action Icon */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Discipler Image / Gray Circle Placeholder */}
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-200 ring-1 ring-slate-300/40">
            {leaderImageUrl ? (
              <img
                src={leaderImageUrl}
                alt={displayLeaderName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-slate-200" />
            )}
          </div>

          {/* Discipler Name */}
          <span className="text-sm font-medium text-slate-600">
            {displayLeaderName}
          </span>
        </div>

        {action ?? (
          <button
            type="button"
            onClick={onActionClick}
            aria-label={`Options for ${title}`}
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-midnight-teal"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Middle: Group Title (Enlarged) */}
      <div className="mt-4">
        <h3 className="line-clamp-2 text-lg sm:text-xl font-bold tracking-tight text-midnight-teal text-center">
          {title}
        </h3>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-slate-100" />

      {/* Footer: Users Icon + Seats Capacity (Aligned to the Right) */}
      <div className="flex items-center justify-end gap-2 text-xs font-medium text-slate-500">
        <Users className="h-4 w-4 text-slate-400" />
        <span>
          {currentSeats} / {maxSeats} {isFull ? "(Full)" : "seats"}
        </span>
      </div>
    </div>
  );
}

export default DiscipleshipGroupCard;
