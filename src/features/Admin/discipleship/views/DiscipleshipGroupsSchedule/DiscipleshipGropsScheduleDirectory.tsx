import { useState, useMemo } from "react";
import {
  DirectoriesFilter,
  type LeaderFilterOption,
} from "../../components/DirectoriesFilter/DirectoriesFilter";
import { filterDiscipleshipGroups } from "../../components/DirectoriesFilter/directoriesFilter.utils";
import { DiscipleshipGroupCardList } from "../../components/DiscipleshipCardList/DiscipleshipGroupCardList";
import type { DiscipleshipGroupItem } from "../../models/types/groupsScheduleViews.types";
import { GROUPS_SCHEDULE_UI } from "../../models/constants/groupsScheduleViews.constants";

export interface DiscipleshipGroupsScheduleDirectoryProps {
  groups: readonly DiscipleshipGroupItem[];
  filteredGroups?: readonly DiscipleshipGroupItem[];
  availableLeaders?: readonly LeaderFilterOption[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedLeaders?: readonly string[];
  onLeaderToggle?: (name: string) => void;
  onClearLeaders?: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onNewGroupClick?: () => void;
  onDiscussionPromptsClick?: () => void;
}

export function DiscipleshipGroupsScheduleDirectory({
  groups,
  filteredGroups: controlledFilteredGroups,
  availableLeaders,
  searchQuery: controlledSearch,
  onSearchChange,
  selectedLeaders: controlledSelectedLeaders,
  onLeaderToggle,
  onClearLeaders,
  isLoading = false,
  error = null,
  onRetry,
  onNewGroupClick,
  onDiscussionPromptsClick,
}: DiscipleshipGroupsScheduleDirectoryProps) {
  const [internalSearch, setInternalSearch] = useState("");
  const [internalSelectedLeaders, setInternalSelectedLeaders] = useState<string[]>([]);

  const searchQuery = controlledSearch ?? internalSearch;
  const selectedLeaders = controlledSelectedLeaders ?? internalSelectedLeaders;

  const handleSearchChange = (query: string) => {
    if (onSearchChange) {
      onSearchChange(query);
    } else {
      setInternalSearch(query);
    }
  };

  const handleLeaderToggle = (name: string) => {
    if (onLeaderToggle) {
      onLeaderToggle(name);
    } else {
      setInternalSelectedLeaders((prev) =>
        prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
      );
    }
  };

  const handleClearLeaders = () => {
    if (onClearLeaders) {
      onClearLeaders();
    } else {
      setInternalSelectedLeaders([]);
    }
  };

  // Real-time filtering matching group title or leader name + selected leaders
  const internalFilteredGroups = useMemo(() => {
    return filterDiscipleshipGroups(groups, searchQuery, selectedLeaders);
  }, [groups, searchQuery, selectedLeaders]);

  const displayGroups = controlledFilteredGroups ?? internalFilteredGroups;

  return (
    <div className="flex flex-col gap-4">
      {/* Responsive Split Toolbar: Filtering (Rows 1 & 2 on mobile) & Actions (Row 3 on mobile) */}
      <div className="relative z-30 flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between md:gap-4">
        {/* Left Section (Filtering Group: Search [Row 1] + Leaders Dropdown [Row 2]) */}
        <DirectoriesFilter
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          leaders={availableLeaders}
          selectedLeaders={selectedLeaders}
          onLeaderToggle={handleLeaderToggle}
          onClearLeaders={handleClearLeaders}
          searchPlaceholder="Search by group title..."
        />

        {/* Right Section (Actions Group: Row 3 on mobile with grid-cols-2) */}
        <div className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:items-center md:gap-2 md:shrink-0">
          <button
            type="button"
            onClick={onDiscussionPromptsClick}
            className="cursor-pointer select-none rounded-2xl border border-midnight-teal/20 bg-white/90 px-3 py-2.5 text-center text-sm font-semibold text-midnight-teal shadow-xs backdrop-blur-md transition-all hover:border-midnight-teal/40 hover:bg-white focus:outline-none focus:ring-2 focus:ring-midnight-teal/20"
          >
            {GROUPS_SCHEDULE_UI.discussionPromptsBtn ?? "Discussion Prompts"}
          </button>

          <button
            type="button"
            onClick={onNewGroupClick}
            className="cursor-pointer select-none rounded-2xl bg-midnight-teal px-3 py-2.5 text-center text-sm font-semibold text-white shadow-xs transition-all hover:bg-midnight-teal/90 focus:outline-none focus:ring-2 focus:ring-midnight-teal/30"
          >
            {GROUPS_SCHEDULE_UI.newGroupBtn ? `+ ${GROUPS_SCHEDULE_UI.newGroupBtn.replace(/^\+\s*/, "")}` : "+ New Group"}
          </button>
        </div>
      </div>

      {/* Showing count, Skeleton loading, Error banner & Scrollable Card Grid */}
      <DiscipleshipGroupCardList
        groups={displayGroups}
        totalActiveCount={groups.length}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
      />
    </div>
  );
}

export default DiscipleshipGroupsScheduleDirectory;
