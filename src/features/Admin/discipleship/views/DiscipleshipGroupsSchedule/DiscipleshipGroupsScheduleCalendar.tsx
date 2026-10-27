import { DiscipleshipCalendarFilter } from "../../components/DiscipleshipCalendar/DiscipleshipCalendarFilter";
import { DiscipleshipCalendar } from "../../components/DiscipleshipCalendar/DiscipleshipCalendar";
import { useDiscipleshipCalendarViewModel } from "../../viewmodels/useDiscipleshipCalendarViewModel";
import type { LeaderFilterOption } from "../../models/types/groupsScheduleDirectory.types";

export interface DiscipleshipGroupsScheduleCalendarProps {
  availableLeaders?: readonly LeaderFilterOption[];
}

export function DiscipleshipGroupsScheduleCalendar({
  availableLeaders = [],
}: DiscipleshipGroupsScheduleCalendarProps) {
  const { navigation, filter, days, status } = useDiscipleshipCalendarViewModel({
    availableLeaders,
  });

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Transparent Filter & Navigation Toolbar */}
      <DiscipleshipCalendarFilter
        formattedWeekRange={navigation.formattedWeekRange}
        onPrevWeek={navigation.onPrevWeek}
        onNextWeek={navigation.onNextWeek}
        onResetToday={navigation.onResetToday}
        isCurrentWeek={navigation.isCurrentWeek}
        leaders={availableLeaders}
        selectedLeaders={filter.selectedLeaders}
        onLeaderToggle={filter.onLeaderToggle}
        onClearLeaders={filter.onClearLeaders}
      />

      {/* 2. Responsive Discipleship Calendar Grid */}
      <DiscipleshipCalendar
        days={days}
        isLoading={status.isLoading}
        error={status.error}
        onRetry={status.onRetry}
      />
    </div>
  );
}

export default DiscipleshipGroupsScheduleCalendar;
