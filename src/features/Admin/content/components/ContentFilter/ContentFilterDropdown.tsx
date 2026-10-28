import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import {
  Dropdown,
  type DropdownOption,
} from "../../../../../shared/components/Dropdown/Dropdown";
import type { ContentFilterOption } from "../../models/constants/contentFilter.constants";

export type { ContentFilterOption };

export interface ContentFilterDropdownProps<T extends string = string> {
  /** Selected value */
  value: T;
  /** Value change callback */
  onChange: (value: T) => void;
  /** Dropdown placeholder label (e.g. "All content types", "All categories") */
  placeholder: string;
  /** List of selectable options */
  options: readonly ContentFilterOption<T>[] | ContentFilterOption<T>[];
  /** The value representing 'all' / unselected filter (defaults to 'all') */
  allValue?: T;
  /** Optional custom trigger class names */
  className?: string;
  /** Width class for the trigger and menu (defaults to 'w-full sm:w-48') */
  width?: string;
  /** Disabled state */
  disabled?: boolean;
}

export function ContentFilterDropdown<T extends string = string>({
  value,
  onChange,
  placeholder,
  options,
  allValue = "all" as T,
  className = "",
  width = "min-w-[11rem]",
  disabled = false,
}: ContentFilterDropdownProps<T>) {
  // Normalize options list: if the options list does not already contain the allValue option, prepend it.
  const resolvedOptions = useMemo<ContentFilterOption<T>[]>(() => {
    const hasAll = options.some((opt) => opt.value === allValue);
    if (!hasAll && placeholder) {
      return [{ value: allValue, label: placeholder }, ...options];
    }
    return [...options];
  }, [options, allValue, placeholder]);

  // Find the display label for the currently selected value
  const selectedLabel = useMemo(() => {
    if (value === allValue) return placeholder;
    const match = resolvedOptions.find((opt) => opt.value === value);
    return match ? match.label : placeholder;
  }, [value, allValue, resolvedOptions, placeholder]);

  // Map into shared Dropdown options format
  const dropdownItems = useMemo<DropdownOption<T>[]>(() => {
    return resolvedOptions.map((opt) => ({
      id: opt.value,
      label: (
        <span className={opt.value === value ? "font-semibold text-primary" : ""}>
          {opt.label}
        </span>
      ),
      onClick: () => onChange(opt.value),
    }));
  }, [resolvedOptions, value, onChange]);

  return (
    <Dropdown
      items={dropdownItems}
      closeOnSelect={true}
      width={width}
      className={className}
      trigger={(isOpen) => (
        <button
          type="button"
          disabled={disabled}
          className={`flex h-11 items-center justify-between gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 select-none cursor-pointer ${width}`.trim()}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 stroke-[2] text-primary transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      )}
    />
  );
}

export default ContentFilterDropdown;
