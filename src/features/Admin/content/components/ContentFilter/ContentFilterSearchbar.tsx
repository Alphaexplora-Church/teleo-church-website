import { useState } from "react";
import { Search } from "lucide-react";
import { CONTENT_FILTER_DEFAULTS } from "../../models/constants/contentFilter.constants";

export interface ContentFilterSearchbarProps {
  /** Search text value (controlled) */
  value?: string;
  /** Alias for value */
  searchQuery?: string;
  /** Callback fired when search text changes */
  onChange?: (value: string) => void;
  /** Alias for onChange */
  onSearchChange?: (value: string) => void;
  /** Input placeholder text (defaults to "Search by title or category...") */
  placeholder?: string;
  /** Custom container class names */
  className?: string;
  /** Optional autoFocus */
  autoFocus?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Reusable real-time search input for the Content / Journeys filter toolbar.
 */
export function ContentFilterSearchbar({
  value: controlledValue,
  searchQuery: controlledQuery,
  onChange,
  onSearchChange,
  placeholder = CONTENT_FILTER_DEFAULTS.searchPlaceholder,
  className = "",
  autoFocus = false,
  disabled = false,
}: ContentFilterSearchbarProps) {
  // Support both controlled and uncontrolled states
  const [internalValue, setInternalValue] = useState("");
  const currentValue = controlledValue ?? controlledQuery ?? internalValue;

  const handleChange = (nextValue: string) => {
    if (onChange) onChange(nextValue);
    if (onSearchChange) onSearchChange(nextValue);
    if (controlledValue === undefined && controlledQuery === undefined) {
      setInternalValue(nextValue);
    }
  };

  return (
    <div className={`relative flex w-full items-center ${className}`.trim()}>
      {/* Search Icon */}
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 stroke-[1.75] text-slate-400 select-none"
      />

      {/* Input Field */}
      <input
        type="text"
        value={currentValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={placeholder}
        className="h-11 w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm font-normal text-primary placeholder:text-slate-400 shadow-2xs transition-all hover:border-slate-300 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

export default ContentFilterSearchbar;