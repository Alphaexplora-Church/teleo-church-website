import { useEffect } from "react";
import { ChevronDown } from "lucide-react";
import {
  Dropdown,
  type DropdownOption,
} from "../../../../../shared/components/Dropdown/Dropdown";
import type { DiscipleshipApplicationDropdownGroupProps } from "../../models/types/discipleshipApplication.types";
import { getLowestRemainingCapacityGroupId } from "../../models/utils/discipleshipApplication.utils";

export function DiscipleshipApplicationDropdownGroup({
  groups,
  selectedGroupId,
  onChange,
  disabled = false,
  className = "",
  onOpenChange,
}: DiscipleshipApplicationDropdownGroupProps) {
  // Auto-select group with lowest remaining seats if none is selected
  useEffect(() => {
    if (!selectedGroupId && groups.length > 0) {
      const defaultId = getLowestRemainingCapacityGroupId(groups);
      if (defaultId) {
        onChange(defaultId);
      }
    }
  }, [selectedGroupId, groups, onChange]);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const displayText = selectedGroup
    ? `${selectedGroup.name} — ${selectedGroup.currentSeats}/${selectedGroup.maxSeats}`
    : "Select group...";

  const dropdownItems: DropdownOption[] =
    groups.length === 0
      ? [
          {
            id: "no-groups",
            label: (
              <span className="text-xs text-slate-400 italic py-1 block">
                No groups available
              </span>
            ),
            disabled: true,
          },
        ]
      : groups.map((group) => {
          const isFull = group.currentSeats >= group.maxSeats;
          const isSelected = group.id === selectedGroupId;

          return {
            id: group.id,
            label: (
              <div className="flex w-full items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-slate-800 truncate">
                  {group.name}
                </span>
                <span
                  className={`shrink-0 font-medium ${
                    isFull ? "font-bold text-rose-500" : "text-slate-500"
                  }`}
                >
                  {group.currentSeats}/{group.maxSeats} {isFull ? "(Full)" : ""}
                </span>
              </div>
            ),
            checked: isSelected,
            disabled: isFull,
            onClick: () => onChange(group.id),
          };
        });

  return (
    <Dropdown
      align="left"
      placement="bottom"
      width="w-full"
      closeOnSelect={true}
      onOpenChange={onOpenChange}
      className={`relative z-50 w-full sm:w-80 ${className}`.trim()}
      menuClassName="!left-0 !top-full !mt-1.5 !w-full !bg-white !rounded-xl !shadow-xl !border !border-slate-200/80 overflow-hidden !p-1"
      items={dropdownItems}
      trigger={(isOpen) => (
        <button
          type="button"
          disabled={disabled || groups.length === 0}
          className={`flex h-10 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-sm font-medium text-slate-800 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 select-none ${
            isOpen ? "border-primary/40 bg-white ring-2 ring-primary/10" : ""
          }`}
        >
          <span
            className={`truncate text-left ${
              !selectedGroup
                ? "text-slate-400 font-normal"
                : "text-slate-800 font-semibold"
            }`}
          >
            {displayText}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-primary" : ""
            }`}
          />
        </button>
      )}
    />
  );
}

export default DiscipleshipApplicationDropdownGroup;
