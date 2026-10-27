import type { LeaderFilterOption } from "./groupsScheduleDirectory.types";

export type MeetingType = "in-person" | "online" | "hybrid";

/**
 * Raw meeting contract from GET /api/churches/:churchId/discipleship-calendar (Journey 13b)
 */
export interface ApiDiscipleshipMeeting {
  id?: string | number;
  meeting_id?: string | number;
  discipleship_id?: string | number;
  group_id?: string | number;
  title?: string;
  group_name?: string;
  discipler_user_id?: string;
  leader_name?: string;
  leader_image_url?: string;
  meeting_date?: string; // "YYYY-MM-DD"
  meeting_time?: string; // "18:30" or "6:30 PM"
  start_time?: string;
  end_time?: string;
  meeting_type?: MeetingType | string;
  location?: string; // e.g. "Room 204", "Annex Room A", "Cafe Loft"
  platform?: string; // e.g. "Online Zoom", "Google Meet"
  room?: string;
}

export interface DiscipleshipCalendarResponse {
  meetings: ApiDiscipleshipMeeting[];
}

/**
 * Client-facing domain entity for a calendar meeting session
 */
export interface DiscipleshipCalendarSession {
  id: string | number;
  groupId: string | number;
  groupTitle: string;
  leaderId?: string;
  leaderName: string;
  leaderImageUrl?: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // e.g. "6:30 PM"
  endTime?: string;
  meetingType: MeetingType;
  location?: string;
  platform?: string;
  hasOverlap?: boolean;
}

/**
 * 7-Day week column representation
 */
export interface CalendarDayColumn {
  date: string; // "YYYY-MM-DD"
  dayName: string; // "MON", "TUE", etc.
  dayNumber: number; // 20, 21, etc.
  isToday: boolean;
  sessions: DiscipleshipCalendarSession[];
  hasOverlap: boolean;
}

export interface DiscipleshipCalendarFilterProps {
  formattedWeekRange: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onResetToday: () => void;
  isCurrentWeek: boolean;
  leaders?: readonly LeaderFilterOption[];
  selectedLeaders: readonly string[];
  onLeaderToggle: (name: string) => void;
  onClearLeaders: () => void;
  className?: string;
}

export interface DiscipleshipCalendarSchedCardProps {
  session: DiscipleshipCalendarSession;
  className?: string;
}

export interface DiscipleshipCalendarProps {
  days: CalendarDayColumn[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}
