import { MapPin, Video, Monitor } from "lucide-react";
import { Badge } from "../../../../../shared/components/Badge/Badge";
import type { DiscipleshipCalendarSchedCardProps } from "../../models/types/discipleshipCalendar.types";

export function DiscipleshipCalendarSchedCard({
  session,
  className = "",
}: DiscipleshipCalendarSchedCardProps) {
  const {
    groupTitle,
    leaderName,
    leaderImageUrl,
    startTime,
    meetingType,
    location,
    platform,
    hasOverlap,
  } = session;

  const initials = leaderName
    ? leaderName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "LD";

  // Location / Platform description
  const meetingVenue =
    meetingType === "online"
      ? platform || "Online Zoom"
      : meetingType === "hybrid"
        ? `${location || "Campus"} / ${platform || "Zoom"}`
        : location || "Campus Room";

  return (
    <div
      className={`group flex flex-col gap-2 rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs ${className}`.trim()}
    >
      {/* Group Title & Overlap Alert */}
      <div className="flex items-start justify-between gap-1.5">
        <h5 className="font-sans text-xs font-bold leading-snug tracking-tight text-primary line-clamp-2">
          {groupTitle}
        </h5>
        {hasOverlap && (
          <Badge
            variant="warning"
            size="sm"
            className="shrink-0 font-bold uppercase tracking-wider text-[9px]"
          >
            Overlap
          </Badge>
        )}
      </div>

      {/* Time & Venue Row */}
      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
        {meetingType === "online" ? (
          <Video className="h-3 w-3 shrink-0 text-secondary" />
        ) : meetingType === "hybrid" ? (
          <Monitor className="h-3 w-3 shrink-0 text-secondary" />
        ) : (
          <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
        )}
        <span className="truncate">
          {startTime} · {meetingVenue}
        </span>
      </div>

      {/* Leader Row */}
      <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-slate-600">
        {leaderImageUrl ? (
          <img
            src={leaderImageUrl}
            alt={leaderName}
            className="h-4 w-4 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
          />
        ) : (
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[8px] font-bold text-slate-600">
            {initials}
          </span>
        )}
        <span className="truncate font-medium">{leaderName}</span>
      </div>
    </div>
  );
}

export default DiscipleshipCalendarSchedCard;
