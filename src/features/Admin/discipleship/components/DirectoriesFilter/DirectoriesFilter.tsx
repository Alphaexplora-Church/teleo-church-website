import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, Search, Users, X } from "lucide-react";
import {
  Dropdown,
  DropdownDivider,
  DropdownHeader,
} from "../../../../../shared/components/Dropdown/Dropdown";
import { dropdownItemVariants } from "../../../../../shared/components/Dropdown/dropdown.animations";

export interface LeaderFilterOption {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface DirectoriesFilterProps {
  /** Search query string */
  searchQuery?: string;
  /** Callback when search input changes */
  onSearchChange?: (query: string) => void;
  /** Array of available leaders for the checklist */
  leaders?: readonly LeaderFilterOption[];
  /** Currently selected leader names */
  selectedLeaders?: readonly string[];
  /** Callback when a leader selection is toggled */
  onLeaderToggle?: (leaderName: string) => void;
  /** Callback to clear all selected leader filters */
  onClearLeaders?: () => void;
  /** Optional placeholder for the search input */
  searchPlaceholder?: string;
  /** Optional container className */
  className?: string;
}

const DEFAULT_LEADERS: LeaderFilterOption[] = [
  { id: "mark", name: "Mark Reyes" },
  { id: "ana", name: "Ana Villar" },
  { id: "sam", name: "Sam Ortiz" },
  { id: "daniel", name: "Daniel Santos" },
  { id: "esther", name: "Esther Lim" },
  { id: "marcus", name: "Marcus Tan" },
];

export function DirectoriesFilter({
  searchQuery: controlledSearch,
  onSearchChange,
  leaders = DEFAULT_LEADERS,
  selectedLeaders: controlledSelectedLeaders,
  onLeaderToggle,
  onClearLeaders,
  searchPlaceholder = "Search by group title...",
  className = "",
}: DirectoriesFilterProps) {
  // Support both controlled and uncontrolled states
  const [internalSearch, setInternalSearch] = useState("");
  const [internalSelectedLeaders, setInternalSelectedLeaders] = useState<
    string[]
  >([]);

  const searchQuery = controlledSearch ?? internalSearch;
  const selectedLeaders =
    controlledSelectedLeaders ?? internalSelectedLeaders;

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalSearch(value);
    }
  };

  const handleClearSearch = () => {
    handleSearchChange("");
  };

  const handleToggleLeader = (name: string) => {
    if (onLeaderToggle) {
      onLeaderToggle(name);
    } else {
      setInternalSelectedLeaders((prev) =>
        prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
      );
    }
  };

  const handleClearAllLeaders = () => {
    if (onClearLeaders) {
      onClearLeaders();
    } else {
      setInternalSelectedLeaders([]);
    }
  };

  const selectedCount = selectedLeaders.length;

  return (
    <div
      className={`relative z-30 flex flex-col gap-2.5 w-full md:flex-row md:items-center md:gap-2 md:max-w-xl md:flex-1 ${className}`.trim()}
    >
      {/* Search Input Bar with its own rounded container (Row 1 on mobile) */}
      <div className="relative w-full min-w-0 md:flex-1 rounded-2xl border border-midnight-teal/10 bg-white/90 shadow-sm backdrop-blur-md transition-all focus-within:border-midnight-teal/30 focus-within:ring-2 focus-within:ring-midnight-teal/10 hover:border-midnight-teal/20">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-midnight-teal/45"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-transparent py-2.5 pr-10 pl-11 text-sm font-medium text-midnight-teal placeholder:text-midnight-teal/40 focus:outline-none"
        />

        {searchQuery.length > 0 && (
          <button
            type="button"
            onClick={handleClearSearch}
            aria-label="Clear search"
            className="absolute top-1/2 right-3.5 z-10 -translate-y-1/2 cursor-pointer text-slate-400 transition-colors hover:text-midnight-teal"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Leader Checklist Dropdown Button (Row 2 on mobile) */}
      <Dropdown
        align="left"
        width="w-full sm:w-72"
        className="w-full md:w-auto"
        trigger={(isOpen) => (
          <button
            type="button"
            className={`flex h-full min-h-11 w-full shrink-0 cursor-pointer items-center justify-between gap-2.5 rounded-2xl border border-midnight-teal/10 bg-white/90 px-4 py-2.5 text-sm font-semibold text-midnight-teal shadow-sm backdrop-blur-md transition-all select-none hover:bg-white hover:border-midnight-teal/20 focus:ring-2 focus:ring-midnight-teal/30 focus:outline-none md:w-auto md:min-w-[9rem] ${
              selectedCount > 0
                ? "border-midnight-teal bg-midnight-teal text-white hover:bg-midnight-teal/90"
                : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <Users
                className={`h-4 w-4 shrink-0 ${
                  selectedCount > 0 ? "text-white" : "text-midnight-teal/60"
                }`}
              />
              <span>Leaders</span>

              {selectedCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-xs font-bold text-white">
                  {selectedCount}
                </span>
              )}
            </div>

            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                selectedCount > 0 ? "text-white" : "text-midnight-teal/50"
              } ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        )}
      >
        <div className="flex flex-col p-1">
          {/* Dropdown Header with Clear Option */}
          <div className="flex items-center justify-between px-2 pt-1 pb-1.5">
            <DropdownHeader className="px-0 py-0 text-midnight-teal/60">
              Filter by Discipler
            </DropdownHeader>

            {selectedCount > 0 && (
              <button
                type="button"
                onClick={handleClearAllLeaders}
                className="cursor-pointer text-xs font-semibold text-midnight-teal/70 underline transition-colors hover:text-midnight-teal"
              >
                Clear ({selectedCount})
              </button>
            )}
          </div>

          <DropdownDivider className="my-1" />

          {/* Checklist of Leaders */}
          <ul className="m-0 flex max-h-64 flex-col gap-0.5 overflow-y-auto p-0 list-none">
            {leaders.map((leader) => {
              const isChecked = selectedLeaders.includes(leader.name);

              return (
                <motion.li
                  key={leader.id}
                  variants={dropdownItemVariants}
                  className="list-none"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleLeader(leader.name)}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-midnight-teal/5"
                  >
                    {/* Left side: Avatar Image / Gray Circle + Leader Name */}
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-slate-200 ring-1 ring-slate-300/40">
                        {leader.imageUrl ? (
                          <img
                            src={leader.imageUrl}
                            alt={leader.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-slate-200" />
                        )}
                      </div>

                      <span className="truncate text-sm font-medium text-midnight-teal">
                        {leader.name}
                      </span>
                    </div>

                    {/* Right side: Checkbox */}
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        isChecked
                          ? "border-midnight-teal bg-midnight-teal text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </Dropdown>
    </div>
  );
}

export default DirectoriesFilter;
