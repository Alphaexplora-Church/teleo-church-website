import { AlertCircle, ClipboardList, RefreshCw, X } from "lucide-react";
import { DiscipleshipApplicationFilter } from "../components/DiscipleshipApplication/DiscipleshipApplicationFilter";
import { DiscipleshipApplicationCollapsibleCard } from "../components/DiscipleshipApplication/DiscipleshipApplicationCollapsibleCard";
import { DiscipleshipModalIntakeSchema } from "../components/DiscipleshipModal/DiscipleshipModalIntakeSchema";
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

      {/* Review Error Notification */}
      {vm.reviewError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{vm.reviewError}</span>
          </div>
          <button
            type="button"
            onClick={vm.clearReviewError}
            className="cursor-pointer text-red-500 hover:text-red-700"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 2. Filter Tabs & Action Button Row */}
      <DiscipleshipApplicationFilter
        activeFilter={vm.filter.active}
        onFilterChange={vm.filter.onChange}
        counts={vm.filter.counts}
        onOpenIntakeSchema={vm.intakeSchema.onOpen}
      />

      {/* 3. Applicant Cards List / Loading / Error States */}
      {vm.isLoading ? (
        <div className="flex flex-col gap-3.5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-20 animate-pulse rounded-2xl border border-slate-200/60 bg-white/70"
            />
          ))}
        </div>
      ) : vm.error ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-red-50/50 p-8 text-center select-none">
          <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
          <p className="font-sans text-sm font-semibold text-red-800">
            {vm.error}
          </p>
          <button
            type="button"
            onClick={vm.onRetry}
            className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-red-700 shadow-2xs hover:bg-red-50 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      ) : vm.applicants.length === 0 ? (
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
              isProcessing={vm.processingApplicantIds.includes(applicant.id)}
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
        error={vm.intakeSchema.error}
      />
    </div>
  );
}

export default DiscipleshipApplicationsViews;
