import { useMemo } from "react";
import {
  TabSwitch,
  type TabOption,
} from "../../../../../shared/components/TabSwitch/TabSwitch";

export type DiscipleshipTab = "directory" | "calendar";

export interface DiscipleshipTabSwitchProps {
  activeTab: DiscipleshipTab;
  onChange: (tab: DiscipleshipTab) => void;
  directoryCount?: number;
  className?: string;
  fullWidth?: boolean | "mobile";
}

export function DiscipleshipTabSwitch({
  activeTab,
  onChange,
  directoryCount,
  className = "",
  fullWidth = "mobile",
}: DiscipleshipTabSwitchProps) {
  const tabs = useMemo<TabOption<DiscipleshipTab>[]>(
    () => [
      {
        id: "directory",
        label: "Directory",
        count: directoryCount,
      },
      {
        id: "calendar",
        label: "Calendar",
      },
    ],
    [directoryCount],
  );

  return (
    <TabSwitch
      tabs={tabs}
      activeTab={activeTab}
      onChange={onChange}
      layoutId="discipleship-tab-active-pill"
      className={className}
      fullWidth={fullWidth}
    />
  );
}

export default DiscipleshipTabSwitch;