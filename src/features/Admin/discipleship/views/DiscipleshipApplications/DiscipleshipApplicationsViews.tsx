import { ClipboardList } from "lucide-react";
import { DiscipleshipApplicationFilter } from "../../components/DiscipleshipApplication/DiscipleshipApplicationFilter";
import { DiscipleshipApplicationCollapsibleCard } from "../../components/DiscipleshipApplication/DiscipleshipApplicationCollapsibleCard";
import { DiscipleshipModalIntakeSchema } from "../../components/DiscipleshipModal/DiscipleshipModalIntakeSchema";
import { DISCIPLESHIP_APPLICATIONS_UI } from "../../models/constants/groupsScheduleViews.constants";
import { DISCIPLESHIP_APPLICATIONS_EMPTY_STATES } from "../../models/constants/discipleshipApplication.constants";
import { useDiscipleshipApplicationsViewModel } from "../../viewmodels/useDiscipleshipApplicationsViewModel";

export function DiscipleshipApplicationsViews() {
  const vm = useDiscipleshipApplicationsViewModel();

  return (
    <div className="space-y-6">
      {/* 1. View Header */}
      <div className="space-y-1">
        <h1 className="font-serif text-2xl text-primary">
          {DISCIPLESHIP_APPLICATIONS_UI.title}
        </h1>
        <p className="text-sm text-primary/70">
          {DISCIPLESHIP_APPLICATIONS_UI.description}
        </p>
      </div>

      {/* 2. Filter Tabs & Action Button Row */}
      <DiscipleshipApplicationFilter
        activeFilter={vm.filter.active}
        onFilterChange={vm.filter.onChange}
        counts={vm.filter.counts}
        onOpenIntakeSchema={vm.intakeSchema.onOpen}
      />

      {/* 3. Applicant Cards List */}
      {vm.applicants.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 p-10 text-center select-none">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
            <ClipboardList className="h-6 w-6 stroke-[1.5]" />
          </div>
          <p className="font-sans text-sm font-semibold text-slate-700">
            {DISCIPLESHIP_APPLICATIONS_EMPTY_STATES.noPendingApplications}
          </p>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            {DISCIPLESHIP_APPLICATIONS_EMPTY_STATES.emptyApplicationsSubtext}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {vm.applicants.map((applicant) => (
            <DiscipleshipApplicationCollapsibleCard
              key={applicant.id}
              applicant={applicant}
              availableGroups={vm.availableGroups}
              isExpanded={vm.expandedApplicantIds.includes(applicant.id)}
              onToggleExpand={() => vm.onToggleExpand(applicant.id)}
              onApprove={vm.actions.onApprove}
              onReject={vm.actions.onReject}
            />
          ))}
        </div>
      )}

      {/* 4. Intake Schema Management Modal */}
      <DiscipleshipModalIntakeSchema
        isOpen={vm.intakeSchema.isOpen}
        onClose={vm.intakeSchema.onClose}
        questions={vm.intakeSchema.questions}
        onSaveSchema={vm.intakeSchema.onSave}
        isLoading={vm.intakeSchema.isLoading}
      />
    </div>
  );
}

export default DiscipleshipApplicationsViews;
