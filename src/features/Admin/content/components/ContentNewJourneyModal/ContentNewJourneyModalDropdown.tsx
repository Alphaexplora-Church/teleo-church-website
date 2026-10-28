import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import {
  Dropdown,
  type DropdownOption,
} from "../../../../../shared/components/Dropdown/Dropdown";
import type { JourneyContentType } from "../../models/types/adminContent.types";

export interface ContentNewJourneyModalDropdownOption<T = string> {
  value: T;
  label: string;
}

export const DEFAULT_JOURNEY_CONTENT_TYPES: readonly ContentNewJourneyModalDropdownOption<JourneyContentType>[] = [
  { value: "sermon-series", label: "SERMON SERIES" },
  { value: "bible-study", label: "BIBLE STUDY" },
  { value: "devotional", label: "DEVOTIONAL" },
  { value: "discipleship-course", label: "DISCIPLESHIP TRACK" },
] as const;

export interface ContentNewJourneyModalDropdownProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options?: readonly ContentNewJourneyModalDropdownOption<T>[] | ContentNewJourneyModalDropdownOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ContentNewJourneyModalDropdown<T extends string = string>({
  value,
  onChange,
  options = DEFAULT_JOURNEY_CONTENT_TYPES as unknown as ContentNewJourneyModalDropdownOption<T>[],
  placeholder = "Select type",
  disabled = false,
  className = "",
}: ContentNewJourneyModalDropdownProps<T>) {
  const selectedLabel = useMemo(() => {
    const match = options.find((opt) => opt.value === value);
    return match ? match.label : placeholder;
  }, [value, options, placeholder]);

  const dropdownItems = useMemo<DropdownOption<T>[]>(() => {
    return options.map((opt) => ({
      id: opt.value,
      label: (
        <span
          className={
            opt.value === value ? "font-semibold text-primary" : "text-slate-700"
          }
        >
          {opt.label}
        </span>
      ),
      // strictly NO `checked` prop to avoid rendering checkmark icon
      onClick: () => onChange(opt.value),
    }));
  }, [options, value, onChange]);

  return (
    <Dropdown
      items={dropdownItems}
      closeOnSelect={true}
      width="w-full"
      className={`w-full ${className}`.trim()}
      trigger={(isOpen) => (
        <button
          type="button"
          disabled={disabled}
          className="flex h-[42px] w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-2xs transition-all hover:border-slate-300 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 select-none cursor-pointer"
        >
          <span className="truncate uppercase tracking-wide">
            {selectedLabel}
          </span>
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

export default ContentNewJourneyModalDropdown;
