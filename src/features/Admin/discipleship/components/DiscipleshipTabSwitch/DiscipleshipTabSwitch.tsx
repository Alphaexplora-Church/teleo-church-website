import { useMemo } from "react";
import {
  TabSwitch,
  type TabOption,
} from "../../../../../shared/components/TabSwitch/TabSwitch";
import type { DiscipleshipTab } from "../../models/types/groupsScheduleDirectory.types";

export type { DiscipleshipTab };

export interface DiscipleshipTabSwitchProps {
  activeTab: DiscipleshipTab;
  onChange: (tab: DiscipleshipTab) => void;
  calendarTodayCount?: number;
  className?: string;
  fullWidth?: boolean | "mobile";
}

export function DiscipleshipTabSwitch({
  activeTab,
  onChange,
  calendarTodayCount,
  className = "",
  fullWidth = "mobile",
}: DiscipleshipTabSwitchProps) {
  const tabs = useMemo<TabOption<DiscipleshipTab>[]>(
    () => [
      {
        id: "directory",
        label: "Directory",
      },
      {
        id: "calendar",
        label: "Calendar",
        count: calendarTodayCount,
      },
    ],
    [calendarTodayCount],
  );

  return (
    <TabSwitch
      tabs={tabs}
      activeTab={activeTab}
      onChange={onChange}
      layoutId="discipleship-tab-active-pill"
      className={className}
      fullWidth={fullWidth}
      activePillClassName="bg-primary shadow-md shadow-primary/20"
      activeTextClassName="text-white hover:text-white"
      inactiveTextClassName="text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
    />
  );
}

export default DiscipleshipTabSwitch;