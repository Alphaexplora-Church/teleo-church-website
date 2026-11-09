import { useState } from "react";
import { ToggleSwitch } from "../../../../../shared/components/ToggleSwitch/ToggleSwitch";
import {
  DiscipleshipTabSwitch,
} from "../../components/DiscipleshipTabSwitch/DiscipleshipTabSwitch";
import { DiscipleshipModalNewGroup } from "../../components/DiscipleshipModal/DiscipleshipModalNewGroup";
import { DiscipleshipModalDiscussionPrompt } from "../../components/DiscipleshipModal/DiscipleshipModalDiscussionPrompt";
import { DiscipleshipModalRemoveGroup } from "../../components/DiscipleshipModal/DiscipleshipModalRemoveGroup";
import { DiscipleshipGroupsScheduleDirectory } from "./DiscipleshipGroupsScheduleDirectory";
import { DiscipleshipGroupsScheduleCalendar } from "./DiscipleshipGroupsScheduleCalendar";
import { GROUPS_SCHEDULE_UI } from "../../models/constants/groupsScheduleViews.constants";
import { useDiscipleshipViewModel } from "../../viewmodels/useDiscipleshipViewModel";
import type { DiscipleshipGroupItem } from "../../models/types/groupsScheduleDirectory.types";

export function DiscipleshipGroupsScheduleViews() {
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [isDiscussionPromptModalOpen, setIsDiscussionPromptModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<DiscipleshipGroupItem | null>(null);
  const [removingGroup, setRemovingGroup] = useState<DiscipleshipGroupItem | null>(null);

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
          onEditGroup={(group) => setEditingGroup(group)}
          onRemoveGroup={(group) => setRemovingGroup(group)}
        />
      ) : (
        <DiscipleshipGroupsScheduleCalendar availableLeaders={vm.filter.leaders} />
      )}

      {/* Reusable Create New Discipleship Group Modal */}
      <DiscipleshipModalNewGroup
        isOpen={isNewGroupModalOpen}
        onClose={() => {
          setIsNewGroupModalOpen(false);
          vm.groupCreation.clearError();
        }}
        availableLeaders={vm.groupCreation.candidates}
        isLoading={vm.groupCreation.isCreating}
        error={vm.groupCreation.error}
        onSubmit={async (formData) => {
          const success = await vm.groupCreation.onCreateGroup(formData);
          if (success) {
            setIsNewGroupModalOpen(false);
          }
        }}
      />

      {/* Reusable Edit Discipleship Group Modal */}
      <DiscipleshipModalNewGroup
        isOpen={Boolean(editingGroup)}
        title="Edit Discipleship Group"
        submitLabel="Save Changes"
        initialData={
          editingGroup
            ? {
                name: editingGroup.title,
                maxCapacity: editingGroup.maxSeats,
                disciplerId: editingGroup.leaderId,
                disciplerName: editingGroup.leaderName,
                disciplerImageUrl: editingGroup.leaderImageUrl,
              }
            : undefined
        }
        onClose={() => {
          setEditingGroup(null);
          vm.groupManagement.clearErrors();
        }}
        availableLeaders={vm.groupManagement.candidates}
        isLoading={vm.groupManagement.isUpdating}
        error={vm.groupManagement.updateError}
        onSubmit={async (formData) => {
          if (!editingGroup) return;
          const success = await vm.groupManagement.onUpdateGroup(
            String(editingGroup.id),
            formData,
          );
          if (success) {
            setEditingGroup(null);
          }
        }}
      />

      {/* Reusable Remove Discipleship Group Modal */}
      <DiscipleshipModalRemoveGroup
        isOpen={Boolean(removingGroup)}
        groupTitle={removingGroup?.title}
        onClose={() => {
          setRemovingGroup(null);
          vm.groupManagement.clearErrors();
        }}
        isLoading={vm.groupManagement.isRemoving}
        error={vm.groupManagement.removeError}
        onConfirm={async () => {
          if (!removingGroup) return;
          const success = await vm.groupManagement.onRemoveGroup(
            String(removingGroup.id),
          );
          if (success) {
            setRemovingGroup(null);
          }
        }}
      />

      {/* Reusable Discussion Prompts Modal */}
      <DiscipleshipModalDiscussionPrompt
        isOpen={isDiscussionPromptModalOpen}
        onClose={() => {
          setIsDiscussionPromptModalOpen(false);
          vm.discussionPrompt.clearError();
        }}
        activePrompt={vm.discussionPrompt.activePrompt}
        isLoading={vm.discussionPrompt.isPosting}
        error={vm.discussionPrompt.error}
        onSubmit={async (promptText) => {
          const success = await vm.discussionPrompt.onPostPrompt(promptText);
          if (success) {
            setIsDiscussionPromptModalOpen(false);
          }
        }}
      />
    </div>
  );
}

export default DiscipleshipGroupsScheduleViews;
