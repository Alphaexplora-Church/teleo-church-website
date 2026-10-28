import { BookOpen } from "lucide-react";
import { ContentDashboardCardGrid } from "../components/ContentDashboardCard/ContentDashboardCard";
import { ContentFilterDropdown } from "../components/ContentFilter/ContentFilterDropdown";
import { ContentFilterSearchbar } from "../components/ContentFilter/ContentFilterSearchbar";
import { ContentFilterStatus } from "../components/ContentFilter/ContentFilterStatus";
import { ContentJourneyListCard } from "../components/ContentJourneyList/ContentJourneyListCard";
import type { ToastMessage } from "../viewmodels/useAdminContentViewModel";
import { useAdminContentViewModel } from "../viewmodels/useAdminContentViewModel";
import { ConfirmArchiveModal } from "./ConfirmArchiveModal";
import { ContentNewJourneyModal } from "../components/ContentNewJourneyModal/ContentNewJourneyModal";

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
    categoryOptions,
    contentTypeFilterOptions,
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

  return (
    <div className="flex flex-col min-h-full w-full overflow-x-hidden overflow-y-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 gap-4 sm:gap-6 pb-12 sm:pb-16">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full shrink-0">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-primary">
            Journeys
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Build and publish sermon series, bible studies, and devotional plans.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateJourney}
          className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-xs cursor-pointer select-none shrink-0 flex items-center justify-center text-center"
        >
          New Journey
        </button>
      </div>

      {/* 2. Stats Row */}
      <div className="shrink-0 w-full">
        <ContentDashboardCardGrid
          items={kpiStats}
          isLoading={isLoading && allJourneys.length === 0}
        />
      </div>

      {/* 3. Filters Section */}
      <div className="shrink-0 flex flex-col sm:grid sm:grid-cols-[1fr_auto] gap-3 w-full">
        {/* Search Bar: Order 1 on mobile, Row 1 Col 1 on desktop */}
        <div className="order-1 w-full sm:max-w-md">
          <ContentFilterSearchbar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by title or category..."
          />
        </div>

        {/* Dropdowns: Order 3 on mobile (bottom), Row 1 Col 2 on desktop (right) */}
        <div className="order-3 sm:order-2 w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <ContentFilterDropdown
            value={selectedType}
            onChange={setSelectedType}
            placeholder="All content types"
            options={contentTypeFilterOptions}
            width="w-full sm:min-w-[11rem]"
          />

          <ContentFilterDropdown
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="All categories"
            options={categoryOptions}
            width="w-full sm:min-w-[10rem]"
          />
        </div>

        {/* Status Filter Pills: Order 2 on mobile (under search), Row 2 on desktop */}
        <div className="order-2 sm:order-3 sm:col-span-2 w-full flex flex-wrap items-center gap-2 mt-1 sm:mt-0">
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

      {/* 4. Card List Section */}
      <div className="w-full min-h-0">
        {isLoading && journeys.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-8">
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