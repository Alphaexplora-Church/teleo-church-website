import {
  TabSwitch,
  type TabOption,
} from "../../../../../shared/components/TabSwitch/TabSwitch";
import type { PartContentType } from "../../models/types/adminContent.types";

export interface AddPartsModalSwitchTabProps {
  activeTab: PartContentType;
  onChange: (tab: PartContentType) => void;
  className?: string;
}

export const PART_CONTENT_TYPE_TABS: readonly TabOption<PartContentType>[] = [
  { id: "video", label: "Video Link" },
  { id: "text", label: "Written Passage" },
  { id: "both", label: "Both" },
] as const;

export function AddPartsModalSwitchTab({
  activeTab,
  onChange,
  className = "",
}: AddPartsModalSwitchTabProps) {
  return (
    <TabSwitch
      tabs={PART_CONTENT_TYPE_TABS}
      activeTab={activeTab}
      onChange={onChange}
      layoutId="add-parts-modal-active-pill"
      fullWidth={true}
      containerClassName="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl"
      activePillClassName="bg-slate-900 rounded-lg shadow-xs"
      activeTextClassName="text-white hover:text-white font-semibold text-xs px-3.5 py-2"
      inactiveTextClassName="text-slate-600 hover:text-slate-900 font-medium text-xs px-3.5 py-2 hover:bg-transparent"
      buttonClassName="rounded-lg py-2 px-3.5 text-xs border-0 shadow-none"
      className={className}
    />
  );
}

export default AddPartsModalSwitchTab;
