import { GROUPS_SCHEDULE_UI } from "../../models/constants/groupsScheduleViews.constants";

export function DiscipleshipGroupsScheduleCalendar() {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-midnight-teal/15 bg-white/60 p-12 text-center text-sm font-medium text-midnight-teal/60">
      {GROUPS_SCHEDULE_UI.calendarPlaceholder}
    </div>
  );
}

export default DiscipleshipGroupsScheduleCalendar;
