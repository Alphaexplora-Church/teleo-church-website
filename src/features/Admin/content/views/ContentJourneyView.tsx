import { useMemo } from "react";
import { BookOpen } from "lucide-react";
import { ContentDashboardCardGrid } from "../components/ContentDashboardCard/ContentDashboardCard";
import { ContentFilterDropdown } from "../components/ContentFilter/ContentFilterDropdown";
import { ContentFilterSearchbar } from "../components/ContentFilter/ContentFilterSearchbar";
import { ContentFilterStatus } from "../components/ContentFilter/ContentFilterStatus";
import { ContentJourneyListCard } from "../components/ContentJourneyList/ContentJourneyListCard";
import { CONTENT_TYPE_FILTER_OPTIONS } from "../models/constants/contentFilter.constants";
import type { ToastMessage } from "../viewmodels/useAdminContentViewModel";
import { useAdminContentViewModel } from "../viewmodels/useAdminContentViewModel";
import { ConfirmArchiveModal } from "./ConfirmArchiveModal";
import { ContentNewJourneyModal } from "../components/ContentNewJourneyModal";

// ─── Toast Component ──────────────────────────────────────────────────────────
function Toast({ toast }: { toast: ToastMessage }) {
  if (!toast) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 rounded-xl px-5 py-3 text-sm font-semibold shadow-xl transition-all duration-200 ease-out ${
        toast.type === "success" ? "bg-primary text-white" : "bg-rose-500 text-white"
      }`}
    >
      {toast.msg}
    </div>
  );
}

// ─── Empty State Component ────────────────────────────────────────────────────
function EmptyState({
  hasActiveFilters,
  onClearFilters,
}: {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-12 text-center backdrop-blur-xs my-auto">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
        <BookOpen size={28} />
      </div>
      {hasActiveFilters ? (
        <>
          <p className="font-serif text-lg font-semibold text-primary">
            No journeys match your filters
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Try a different search term or clear your filters.
          </p>
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-4 text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        </>
      ) : (
        <>
          <p className="font-serif text-lg font-semibold text-primary">
            No journeys yet
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Create a new journey to start building a series for your congregation.
          </p>
        </>
      )}
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────
export function ContentJourneyView() {
  const {
    journeys,
    allJourneys,
    kpiStats,
    isLoading,
    error,
    retry,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    selectedCategory,
    setSelectedCategory,
    selectedStatuses,
    toggleStatus,
    availableCategories,
    hasActiveFilters,
    clearFilters,
    handleCreateJourney,
    handleEditJourney,
    handleArchiveJourney,
    handleDeleteJourney,
    isEditorOpen,
    editingJourney,
    closeEditor,
    onJourneySaved,
    toast,
    showToast,
    archiveTarget,
    pendingStatusId,
    closeArchiveModal,
    confirmArchive,
  } = useAdminContentViewModel();

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: "All categories" },
      ...availableCategories.map((cat) => ({ value: cat, label: cat })),
    ],
    [availableCategories],
  );

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 gap-6">
      {/* 1. Sticky / Non-scrolling Section Header */}
      <div className="flex items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-primary">
            Journeys
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Build and publish sermon series, bible studies, and devotional plans.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateJourney}
          className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-sm transition shadow-xs cursor-pointer select-none shrink-0"
        >
          New Journey
        </button>
      </div>

      {/* 2. Sticky / Non-scrolling Stats Row */}
      <div className="shrink-0">
        <ContentDashboardCardGrid
          items={kpiStats}
          isLoading={isLoading && allJourneys.length === 0}
        />
      </div>

      {/* 3. Sticky / Non-scrolling Filters Section */}
      <div className="shrink-0 space-y-3">
        {/* Row 1 (Inputs & Selects): Search bar on left, Dropdowns on right */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <ContentFilterSearchbar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by title or category..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <ContentFilterDropdown
              value={selectedType}
              onChange={setSelectedType}
              placeholder="All content types"
              options={CONTENT_TYPE_FILTER_OPTIONS}
              width="min-w-[11rem]"
            />

            <ContentFilterDropdown
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="All categories"
              options={categoryOptions}
              width="min-w-[10rem]"
            />
          </div>
        </div>

        {/* Row 2 (Status Pills): Directly UNDER the search bar */}
        <div className="flex items-center gap-2 mt-3">
          <ContentFilterStatus
            selectedStatuses={selectedStatuses}
            onToggleStatus={toggleStatus}
          />

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-slate-400 hover:text-primary transition-colors cursor-pointer px-1 select-none"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 4. Scrollable 3-Column Card List */}
      <div className="flex-1 overflow-y-auto pr-1 min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
        {isLoading && journeys.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-2xl border border-slate-200/80 bg-white/60"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center my-4">
            <p className="text-sm font-semibold text-rose-600">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-3 text-xs font-bold text-primary underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : journeys.length === 0 ? (
          <EmptyState
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
            {journeys.map((journey) => (
              <ContentJourneyListCard
                key={journey.id}
                journey={journey}
                onEdit={handleEditJourney}
                onArchive={handleArchiveJourney}
                onDelete={handleDeleteJourney}
              />
            ))}
          </div>
        )}
      </div>

      {/* Toast Feedback */}
      <Toast toast={toast} />

      {/* Journey Creation / Edit Modal */}
      {isEditorOpen && (
        <ContentNewJourneyModal
          key={editingJourney?.id ?? "new"}
          isOpen={isEditorOpen}
          initialJourney={editingJourney}
          onClose={closeEditor}
          onSaved={onJourneySaved}
          showToast={showToast}
        />
      )}

      {/* Confirmation Modal for Archiving */}
      <ConfirmArchiveModal
        open={Boolean(archiveTarget)}
        itemKind="Journey"
        itemTitle={archiveTarget?.title ?? ""}
        isArchiving={pendingStatusId === archiveTarget?.id}
        onCancel={closeArchiveModal}
        onConfirm={() => void confirmArchive()}
      />
    </div>
  );
}

export default ContentJourneyView;