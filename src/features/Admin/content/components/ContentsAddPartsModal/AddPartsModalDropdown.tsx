import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import {
  Dropdown,
  type DropdownOption,
} from "../../../../../shared/components/Dropdown/Dropdown";
import type { PartStatus } from "../../models/types/adminContent.types";

export interface AddPartsModalDropdownOption<T = PartStatus> {
  value: T;
  label: string;
}

export const PART_STATUS_DROPDOWN_OPTIONS: readonly AddPartsModalDropdownOption<PartStatus>[] = [
  { value: "draft", label: "Draft — Hidden from members" },
  { value: "published", label: "Published — Visible when journey goes live" },
] as const;

export interface AddPartsModalDropdownProps<T extends string = PartStatus> {
  value: T;
  onChange: (value: T) => void;
  options?: readonly AddPartsModalDropdownOption<T>[];
  disabled?: boolean;
  className?: string;
}

export function AddPartsModalDropdown<T extends string = PartStatus>({
  value,
  onChange,
  options = PART_STATUS_DROPDOWN_OPTIONS as unknown as readonly AddPartsModalDropdownOption<T>[],
  disabled = false,
  className = "",
}: AddPartsModalDropdownProps<T>) {
  const selectedLabel = useMemo(() => {
    const match = options.find((opt) => opt.value === value);
    return match ? match.label : "Select status";
  }, [value, options]);

  const dropdownItems = useMemo<DropdownOption<T>[]>(() => {
    return options.map((opt) => ({
      id: opt.value,
      label: (
        <span
          className={
            opt.value === value
              ? "font-bold text-slate-900"
              : "font-medium text-slate-700"
          }
        >
          {opt.label}
        </span>
      ),
      // strictly NO `checked` prop to avoid rendering checkmarks
      onClick: () => onChange(opt.value),
    }));
  }, [options, value, onChange]);

  return (
    <Dropdown
      items={dropdownItems}
      closeOnSelect={true}
      width="w-full"
      menuClassName="rounded-xl border border-slate-200/80 bg-white shadow-xl py-1.5"
      className={`w-full ${className}`.trim()}
      trigger={(isOpen) => (
        <button
          type="button"
          disabled={disabled}
          className="flex h-[42px] w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-2xs transition-all hover:border-slate-300 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 select-none cursor-pointer"
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 stroke-[2] text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      )}
    />
  );
}

export default AddPartsModalDropdown;
