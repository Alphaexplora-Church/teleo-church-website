import { useEffect, useRef } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { DiscipleshipCalendarSchedCard } from "./DiscipleshipCalendarSchedCard";
import { DISCIPLESHIP_CALENDAR_UI } from "../../models/constants/discipleshipCalendar.constants";
import type { DiscipleshipCalendarProps } from "../../models/types/discipleshipCalendar.types";

export function DiscipleshipCalendar({
  days,
  isLoading = false,
  error = null,
  onRetry,
  className = "",
}: DiscipleshipCalendarProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const todayCardRef = useRef<HTMLDivElement | null>(null);

  // Auto-center today's card on mobile if present in active week
  useEffect(() => {
    if (todayCardRef.current && containerRef.current) {
      const container = containerRef.current;
      const todayCard = todayCardRef.current;
      if (container.scrollWidth > container.clientWidth) {
        const targetLeft =
          todayCard.offsetLeft - (container.clientWidth - todayCard.clientWidth) / 2;
        container.scrollTo({
          left: Math.max(0, targetLeft),
          behavior: "smooth",
        });
      }
    }
  }, [days]);

  // Error state
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/60 p-8 text-center sm:p-12 ${className}`.trim()}>
        <AlertCircle className="h-8 w-8 text-rose-500 mb-2" />
        <h3 className="font-sans text-base font-bold text-rose-900">
          {DISCIPLESHIP_CALENDAR_UI.failedToLoad}
        </h3>
        <p className="mt-1 text-sm text-rose-700 max-w-md">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-primary/90 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    );
  }

  // Loading skeleton state
  if (isLoading) {
    return (
      <div
        className={`flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-3 pb-2 -mx-4 px-4 overscroll-x-contain md:grid md:grid-cols-7 md:overflow-visible md:mx-0 md:px-0 w-full ${className}`.trim()}
      >
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={`skel-col-${i}`}
            className="flex w-[82vw] sm:w-[320px] shrink-0 snap-center min-h-[380px] flex-col rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-2xs animate-pulse md:w-auto md:shrink md:p-3 md:min-h-[420px]"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-10 rounded bg-slate-200" />
              <div className="h-4 w-6 rounded bg-slate-200" />
            </div>
            <div className="my-2.5 border-b border-slate-100" />
            <div className="flex flex-col gap-2.5 pt-2">
              <div className="h-16 rounded-xl bg-slate-100" />
              {i % 2 === 0 && <div className="h-16 rounded-xl bg-slate-100" />}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-3 pb-2 -mx-4 px-4 overscroll-x-contain md:grid md:grid-cols-7 md:overflow-visible md:mx-0 md:px-0 w-full items-stretch ${className}`.trim()}
    >
      {days.map((column) => (
        <div
          key={column.date}
          ref={column.isToday ? todayCardRef : undefined}
          className={`flex w-[82vw] sm:w-[320px] shrink-0 snap-center flex-col rounded-2xl bg-white/95 p-4 shadow-2xs backdrop-blur-md transition-all min-h-[380px] md:w-auto md:shrink md:p-3 md:min-h-[420px] ${
            column.isToday
              ? "border-2 border-primary bg-primary/[0.02] shadow-xs ring-1 ring-primary/10"
              : "border border-slate-200/80 hover:border-slate-300"
          }`}
        >
          {/* Column Header: Day of week + Date Number */}
          <div className="flex items-center justify-between select-none">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                column.isToday ? "text-primary" : "text-slate-400"
              }`}
            >
              {column.dayName}
            </span>
            <span
              className={`font-sans text-sm font-bold ${
                column.isToday ? "text-primary" : "text-slate-700"
              }`}
            >
              {column.dayNumber}
            </span>
          </div>

          <div className="my-2.5 border-b border-slate-100" />

          {/* Sessions Column Body */}
          {column.sessions.length === 0 ? (
            <div className="my-auto flex flex-col items-center justify-center py-10 text-center select-none">
              <p className="text-xs italic text-slate-400">
                {DISCIPLESHIP_CALENDAR_UI.emptySessions}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {column.sessions.map((session) => (
                <DiscipleshipCalendarSchedCard
                  key={session.id}
                  session={session}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default DiscipleshipCalendar;
