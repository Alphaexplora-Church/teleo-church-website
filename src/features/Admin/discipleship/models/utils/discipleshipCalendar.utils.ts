import type {
  ApiDiscipleshipMeeting,
  DiscipleshipCalendarSession,
  MeetingType,
} from "../types/discipleshipCalendar.types";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const SHORT_DAY_NAMES = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
] as const;

/**
 * Returns the Monday (at 00:00:00) of the week containing the specified date.
 */
export function getMondayOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Returns an array of 7 Date objects starting from Monday through Sunday.
 */
export function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });
}

/**
 * Formats a Date object to "YYYY-MM-DD" in local time.
 */
export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Determines whether two dates fall on the exact same calendar day.
 */
export function isSameDay(d1: Date, d2: Date): boolean {
  return d1.toDateString() === d2.toDateString();
}

/**
 * Formats the active week range string (e.g. "Oct 20 – Oct 26, 2024").
 */
export function formatWeekRange(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const mMonth = MONTH_NAMES[monday.getMonth()];
  const sMonth = MONTH_NAMES[sunday.getMonth()];
  const mYear = monday.getFullYear();
  const sYear = sunday.getFullYear();

  if (mYear !== sYear) {
    return `${mMonth} ${monday.getDate()}, ${mYear} – ${sMonth} ${sunday.getDate()}, ${sYear}`;
  }

  return `${mMonth} ${monday.getDate()} – ${sMonth} ${sunday.getDate()}, ${sYear}`;
}

/**
 * Formats day information for calendar columns.
 */
export function formatDayInfo(d: Date): {
  dayName: string;
  dayNumber: number;
} {
  return {
    dayName: SHORT_DAY_NAMES[d.getDay()],
    dayNumber: d.getDate(),
  };
}

/**
 * Parses time string (e.g. "6:30 PM", "07:00 AM", "18:30") into total minutes from midnight.
 */
export function parseTimeToMinutes(timeStr?: string): number {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridian = match[3]?.toUpperCase();

  if (meridian === "PM" && hours < 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Strictly sorts sessions in ascending order by start time.
 */
export function sortSessionsChronologically(
  sessions: DiscipleshipCalendarSession[],
): DiscipleshipCalendarSession[] {
  return [...sessions].sort(
    (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime),
  );
}

/**
 * Detects time and location/room conflicts among sessions within the same day.
 */
export function detectSessionOverlaps(
  sessions: DiscipleshipCalendarSession[],
): DiscipleshipCalendarSession[] {
  return sessions.map((session, idx) => {
    const hasCollision = sessions.some((other, otherIdx) => {
      if (idx === otherIdx) return false;
      const sameTime =
        parseTimeToMinutes(session.startTime) ===
        parseTimeToMinutes(other.startTime);
      if (!sameTime) return false;

      const sameLocation =
        Boolean(session.location) &&
        session.location!.trim().toLowerCase() ===
          other.location?.trim().toLowerCase();

      const sameLeader =
        Boolean(session.leaderName) &&
        session.leaderName.trim().toLowerCase() ===
          other.leaderName?.trim().toLowerCase();

      return sameLocation || sameLeader;
    });

    return {
      ...session,
      hasOverlap: session.hasOverlap || hasCollision,
    };
  });
}

/**
 * Normalizes meeting type string to typed union.
 */
export function normalizeMeetingType(type?: string): MeetingType {
  const clean = type?.toLowerCase() || "";
  if (clean.includes("online") || clean.includes("virtual") || clean.includes("zoom")) {
    return "online";
  }
  if (clean.includes("hybrid")) {
    return "hybrid";
  }
  return "in-person";
}

/**
 * Maps raw backend API meeting item to domain DiscipleshipCalendarSession.
 */
export function mapApiMeetingToSession(
  meeting: ApiDiscipleshipMeeting,
): DiscipleshipCalendarSession {
  const meetingType = normalizeMeetingType(meeting.meeting_type);

  return {
    id: meeting.meeting_id ?? meeting.id ?? "",
    groupId: meeting.discipleship_id ?? meeting.group_id ?? "",
    groupTitle: meeting.group_name ?? meeting.title ?? "Discipleship Group",
    leaderId: meeting.discipler_user_id,
    leaderName: meeting.leader_name ?? "Assigned Discipler",
    leaderImageUrl: meeting.leader_image_url,
    date: meeting.meeting_date ?? "",
    startTime: meeting.start_time ?? meeting.meeting_time ?? "7:00 PM",
    endTime: meeting.end_time,
    meetingType,
    location: meeting.location ?? meeting.room,
    platform: meeting.platform ?? (meetingType === "online" ? "Online Zoom" : undefined),
  };
}
