import { useState } from "react";
import { ToggleSwitch } from "../../../../../shared/components/ToggleSwitch/ToggleSwitch";
import {
  DiscipleshipTabSwitch,
} from "../../components/DiscipleshipTabSwitch/DiscipleshipTabSwitch";
import { DiscipleshipModalNewGroup } from "../../components/DiscipleshipModal/DiscipleshipModalNewGroup";
import {
  DiscipleshipModalDiscussionPrompt,
  type ActiveDiscussionPrompt,
} from "../../components/DiscipleshipModal/DiscipleshipModalDiscussionPrompt";
import { DiscipleshipGroupsScheduleDirectory } from "./DiscipleshipGroupsScheduleDirectory";
import { DiscipleshipGroupsScheduleCalendar } from "./DiscipleshipGroupsScheduleCalendar";
import { GROUPS_SCHEDULE_UI } from "../../models/constants/groupsScheduleViews.constants";
import { useDiscipleshipViewModel } from "../../viewmodels/useDiscipleshipViewModel";

export function DiscipleshipGroupsScheduleViews() {
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [isDiscussionPromptModalOpen, setIsDiscussionPromptModalOpen] = useState(false);
  const [activeDiscussionPrompt, setActiveDiscussionPrompt] =
    useState<ActiveDiscussionPrompt | null>(null);

  const vm = useDiscipleshipViewModel();

  return (
    <div className="space-y-6">
      {/* Header & Integrated Module Toggle Row */}
      <div className="flex flex-col gap-3.5 md:flex-row md:items-center md:justify-between">
        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="font-serif text-2xl text-primary">
            {GROUPS_SCHEDULE_UI.title}
          </h1>
          <p className="text-sm text-primary/70">
            {GROUPS_SCHEDULE_UI.description}
          </p>
        </div>

        {/* Module Toggle Card: Full-width on mobile (< md), Inline on desktop (md+) */}
        <div className="flex w-full items-center rounded-2xl border border-midnight-teal/10 bg-white/90 px-4 py-2.5 shadow-xs backdrop-blur-md md:w-fit md:shrink-0 md:px-3.5 md:py-1.5">
          <ToggleSwitch
            checked={vm.module.isEnabled}
            onChange={vm.module.onToggle}
            disabled={vm.module.isToggling}
            labelPosition="left"
            size="md"
            className="w-full justify-between md:w-auto"
          >
            {vm.module.isEnabled ? "Active" : "Disabled"} on mobile
          </ToggleSwitch>
        </div>
      </div>

      {/* Tab Switch: Directory & Calendar */}
      <div className="my-6">
        <DiscipleshipTabSwitch
          activeTab={vm.tab.active}
          onChange={vm.tab.onChange}
          calendarTodayCount={vm.tab.todayScheduleCount}
        />
      </div>


      {/* Tab Content */}
      {vm.tab.active === "directory" ? (
        <DiscipleshipGroupsScheduleDirectory
          groups={vm.filteredGroups}
          totalCount={vm.groups.length}
          filter={vm.filter}
          status={vm.status}
          onNewGroupClick={() => setIsNewGroupModalOpen(true)}
          onDiscussionPromptsClick={() => setIsDiscussionPromptModalOpen(true)}
        />
      ) : (
        <DiscipleshipGroupsScheduleCalendar availableLeaders={vm.filter.leaders} />
      )}

      {/* Reusable Create New Discipleship Group Modal */}
      <DiscipleshipModalNewGroup
        isOpen={isNewGroupModalOpen}
        onClose={() => setIsNewGroupModalOpen(false)}
        availableLeaders={vm.filter.leaders}
        onSubmit={() => {
          setIsNewGroupModalOpen(false);
        }}
      />

      {/* Reusable Discussion Prompts Modal */}
      <DiscipleshipModalDiscussionPrompt
        isOpen={isDiscussionPromptModalOpen}
        onClose={() => setIsDiscussionPromptModalOpen(false)}
        activePrompt={activeDiscussionPrompt}
        onSubmit={(promptText) => {
          const formatted =
            promptText.startsWith("“") || promptText.startsWith('"')
              ? promptText
              : `“${promptText}”`;
          setActiveDiscussionPrompt({
            id: Date.now().toString(),
            text: formatted,
            postedAt: "Posted just now",
            status: "ACTIVE",
          });
        }}
      />
    </div>
  );
}

export default DiscipleshipGroupsScheduleViews;
