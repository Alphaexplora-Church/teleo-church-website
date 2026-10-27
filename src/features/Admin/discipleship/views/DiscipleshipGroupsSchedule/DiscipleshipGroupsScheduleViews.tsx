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
import { DiscipleshipGroupsScheduleDirectory } from "./DiscipleshipGropsScheduleDirectory";
import { DiscipleshipGroupsScheduleCalendar } from "./DiscipleshipGroupsScheduleCalendar";
import { GROUPS_SCHEDULE_UI } from "../../models/constants/groupsScheduleViews.constants";
import { useDiscipleshipViewModel } from "../../viewmodels/useDiscipleshipViewModel";

export function DiscipleshipGroupsScheduleViews() {
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [isDiscussionPromptModalOpen, setIsDiscussionPromptModalOpen] = useState(false);
  const [activeDiscussionPrompt, setActiveDiscussionPrompt] =
    useState<ActiveDiscussionPrompt | null>(null);
  const {
    activeTab,
    setActiveTab,
    isModuleEnabled,
    isTogglingModule,
    handleToggleModule,
    groups,
    filteredGroups,
    availableLeaders,
    searchQuery,
    setSearchQuery,
    selectedLeaders,
    handleLeaderToggle,
    handleClearLeaders,
    isLoading,
    error,
    refetch,
  } = useDiscipleshipViewModel();

  return (
    <div className="space-y-6">
      {/* Header & Integrated Module Toggle Row */}
      <div className="flex flex-col gap-3.5 md:flex-row md:items-center md:justify-between">
        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="font-serif text-2xl text-midnight-teal">
            {GROUPS_SCHEDULE_UI.title}
          </h1>
          <p className="text-sm text-midnight-teal/70">
            {GROUPS_SCHEDULE_UI.description}
          </p>
        </div>

        {/* Module Toggle Card: Full-width on mobile (< md), Inline on desktop (md+) */}
        <div className="flex w-full items-center rounded-2xl border border-midnight-teal/10 bg-white/90 px-4 py-2.5 shadow-xs backdrop-blur-md md:w-fit md:shrink-0 md:px-3.5 md:py-1.5">
          <ToggleSwitch
            checked={isModuleEnabled}
            onChange={handleToggleModule}
            disabled={isTogglingModule}
            labelPosition="left"
            size="md"
            className="w-full justify-between md:w-auto"
          >
            {isModuleEnabled ? "Active" : "Disabled"} on mobile
          </ToggleSwitch>
        </div>
      </div>

      {/* Tab Switch: Directory & Calendar */}
      <div className="my-6">
        <DiscipleshipTabSwitch
          activeTab={activeTab}
          onChange={setActiveTab}
          directoryCount={groups.length}
        />
      </div>

      {/* Tab Content */}
      {activeTab === "directory" ? (
        <DiscipleshipGroupsScheduleDirectory
          groups={groups}
          filteredGroups={filteredGroups}
          availableLeaders={availableLeaders}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedLeaders={selectedLeaders}
          onLeaderToggle={handleLeaderToggle}
          onClearLeaders={handleClearLeaders}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          onNewGroupClick={() => setIsNewGroupModalOpen(true)}
          onDiscussionPromptsClick={() => setIsDiscussionPromptModalOpen(true)}
        />
      ) : (
        <DiscipleshipGroupsScheduleCalendar />
      )}

      {/* Reusable Create New Discipleship Group Modal */}
      <DiscipleshipModalNewGroup
        isOpen={isNewGroupModalOpen}
        onClose={() => setIsNewGroupModalOpen(false)}
        availableLeaders={availableLeaders}
        onSubmit={(formData) => {
          console.log("New Discipleship Group Created:", formData);
          setIsNewGroupModalOpen(false);
        }}
      />

      {/* Reusable Discussion Prompts Modal */}
      <DiscipleshipModalDiscussionPrompt
        isOpen={isDiscussionPromptModalOpen}
        onClose={() => setIsDiscussionPromptModalOpen(false)}
        activePrompt={activeDiscussionPrompt}
        onSubmit={(promptText) => {
          console.log("New Discussion Prompt Posted:", promptText);
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
