import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../../shared/context/useAuth";
import { useAbortController, isAbortError } from "../../../../shared/viewmodels/useAbortController";
import { getApiErrorMessage } from "../../../../shared/models/api/axiosClient.api";
import { DiscipleshipCalendarApi } from "../models/api/discipleshipCalendar.api";
import type {
  ApiDiscipleshipMeeting,
  CalendarDayColumn,
  DiscipleshipCalendarSession,
} from "../models/types/discipleshipCalendar.types";
import type { LeaderFilterOption } from "../models/types/groupsScheduleDirectory.types";
import {
  detectSessionOverlaps,
  formatDateISO,
  formatDayInfo,
  formatWeekRange,
  getMondayOfWeek,
  getWeekDays,
  isSameDay,
  mapApiMeetingToSession,
  sortSessionsChronologically,
} from "../models/utils/discipleshipCalendar.utils";

export interface UseDiscipleshipCalendarViewModelOptions {
  churchId?: string | number;
  availableLeaders?: readonly LeaderFilterOption[];
}

export function useDiscipleshipCalendarViewModel(
  options?: UseDiscipleshipCalendarViewModelOptions,
) {
  const { user } = useAuth();
  const churchId = options?.churchId ?? user?.home_church_id ?? 1;
  const { getSignal } = useAbortController();

  // Active navigation date (tracks the week currently viewed)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  // Filter & Network state
  const [selectedLeaders, setSelectedLeaders] = useState<string[]>([]);
  const [rawMeetings, setRawMeetings] = useState<ApiDiscipleshipMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Direct week math without over-memoization
  const monday = getMondayOfWeek(currentDate);
  const weekDays = getWeekDays(monday);
  const formattedWeekRange = formatWeekRange(monday);
  const isCurrentWeek = isSameDay(monday, getMondayOfWeek(new Date()));

  // Navigation handlers
  const handlePrevWeek = useCallback(() => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 7);
      return next;
    });
  }, []);

  const handleNextWeek = useCallback(() => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
  }, []);

  const handleResetToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Leader filter handlers
  const handleLeaderToggle = useCallback((name: string) => {
    setSelectedLeaders((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  }, []);

  const handleClearLeaders = useCallback(() => {
    setSelectedLeaders([]);
  }, []);

  // 2. Data Fetching
  const fetchCalendar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const signal = getSignal();

    try {
      const data = await DiscipleshipCalendarApi.getChurchDiscipleshipCalendar(
        churchId,
        signal,
      );
      setRawMeetings(data.meetings ?? []);
    } catch (err) {
      if (isAbortError(err)) return;
      const message = getApiErrorMessage(err);
      setError(
        message || "Failed to load calendar meetings. Please check your connection.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [churchId, getSignal]);

  useEffect(() => {
    void fetchCalendar();
  }, [fetchCalendar]);

  // 3. Process sessions: Map, Filter by leader, Sort, and Detect Overlaps
  const processedSessions = useMemo<DiscipleshipCalendarSession[]>(() => {
    const mapped = rawMeetings.map(mapApiMeetingToSession);

    if (selectedLeaders.length === 0) {
      return mapped;
    }
    return mapped.filter((s) => selectedLeaders.includes(s.leaderName));
  }, [rawMeetings, selectedLeaders]);

  // 4. Generate 7-Day Week Columns
  const days = useMemo<CalendarDayColumn[]>(() => {
    const today = new Date();

    return weekDays.map((dayDate) => {
      const dateISO = formatDateISO(dayDate);
      const { dayName, dayNumber } = formatDayInfo(dayDate);
      const isToday = isSameDay(dayDate, today);

      const daySessionsRaw = processedSessions.filter(
        (s) => s.date === dateISO,
      );
      const withOverlaps = detectSessionOverlaps(daySessionsRaw);
      const sortedSessions = sortSessionsChronologically(withOverlaps);

      return {
        date: dateISO,
        dayName,
        dayNumber,
        isToday,
        sessions: sortedSessions,
        hasOverlap: sortedSessions.some((s) => s.hasOverlap),
      };
    });
  }, [weekDays, processedSessions]);

  return {
    navigation: {
      formattedWeekRange,
      onPrevWeek: handlePrevWeek,
      onNextWeek: handleNextWeek,
      onResetToday: handleResetToday,
      isCurrentWeek,
    },
    filter: {
      selectedLeaders,
      onLeaderToggle: handleLeaderToggle,
      onClearLeaders: handleClearLeaders,
    },
    days,
    status: {
      isLoading,
      error,
      onRetry: fetchCalendar,
    },
  };
}

export default useDiscipleshipCalendarViewModel;
