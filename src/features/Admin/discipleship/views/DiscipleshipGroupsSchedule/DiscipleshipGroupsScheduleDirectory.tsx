import { DirectoriesFilter } from "../../components/DirectoriesFilter/DirectoriesFilter";
import { DiscipleshipGroupCardList } from "../../components/DiscipleshipCardList/DiscipleshipGroupCardList";
import type { DiscipleshipGroupsScheduleDirectoryProps } from "../../models/types/groupsScheduleViews.types";

export function DiscipleshipGroupsScheduleDirectory({
  groups,
  totalCount,
  filter,
  status,
  onNewGroupClick,
  onDiscussionPromptsClick,
}: DiscipleshipGroupsScheduleDirectoryProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Responsive Split Toolbar: Filtering (Rows 1 & 2 on mobile) & Actions (Row 3 on mobile) */}
      <div className="relative z-30 flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between md:gap-4">
        {/* Left Section: Search Input + Leaders Dropdown */}
        <DirectoriesFilter
          searchQuery={filter.searchQuery}
          onSearchChange={filter.onSearchChange}
          leaders={filter.leaders}
          selectedLeaders={filter.selectedLeaders}
          onLeaderToggle={filter.onLeaderToggle}
          onClearLeaders={filter.onClearLeaders}
          searchPlaceholder="Search by group title..."
        />

        {/* Right Section: Action Buttons */}
        <div className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:items-center md:gap-2 md:shrink-0">
          <button
            type="button"
            onClick={onDiscussionPromptsClick}
            className="cursor-pointer select-none rounded-2xl border border-midnight-teal/20 bg-white/90 px-3 py-2.5 text-center text-sm font-semibold text-midnight-teal shadow-xs backdrop-blur-md transition-all hover:border-midnight-teal/40 hover:bg-white focus:outline-none focus:ring-2 focus:ring-midnight-teal/20"
          >
            Discussion Prompts
          </button>

          <button
            type="button"
            onClick={onNewGroupClick}
            className="cursor-pointer select-none rounded-2xl bg-midnight-teal px-3 py-2.5 text-center text-sm font-semibold text-white shadow-xs transition-all hover:bg-midnight-teal/90 focus:outline-none focus:ring-2 focus:ring-midnight-teal/30"
          >
            New Group
          </button>
        </div>
      </div>

      {/* Showing count, Skeleton loading, Error banner & Scrollable Card Grid */}
      <DiscipleshipGroupCardList
        groups={groups}
        totalActiveCount={totalCount}
        isLoading={status.isLoading}
        error={status.error}
        onRetry={status.onRetry}
      />
    </div>
  );
}

export default DiscipleshipGroupsScheduleDirectory;
