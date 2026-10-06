import { BookOpen, ChevronLeft, ChevronRight, Plus, Search, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import AdminHeader from '../../../../shared/components/AdminHeader';
import AdminSidebar from '../../../../shared/components/AdminSidebar';
import { CONTENT_TYPE_OPTIONS, STATUS_OPTIONS } from '../model/adminContent.types';
import type { JourneySort } from '../model/adminContent.types';
import { useAdminContentViewModel } from '../viewmodel/useAdminContentViewModel';
import type { AdminContentViewModel } from '../viewmodel/useAdminContentViewModel';
import { ConfirmArchiveModal } from './ConfirmArchiveModal';
import { JourneyEditor } from './JourneyEditor';
import { NewJourneyEditor } from './NewJourneyEditor';
import { JourneyPreview } from './JourneyPreview';
import { CompactOverview } from './CompactOverview';
import { JourneyRow } from './JourneyRow';
import { toggleChipClass } from './contentStyles';
import './contentWorkspace.css';

export default function AdminContentView() {
    const vm = useAdminContentViewModel();
    return (
        <div className="admin-shell flex flex-col lg:flex-row">
            <AdminSidebar />
            <div className="relative z-10 flex flex-1 flex-col">
                <AdminHeader />
                <main tabIndex={-1} className="admin-main content-workspace mx-auto w-full max-w-7xl flex-1 space-y-5 px-6 py-8 lg:px-10">
                    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div><h1 className="font-serif text-3xl text-midnight-teal">Journeys</h1><p className="content-muted mt-1 text-sm">Build and publish sermon series, bible studies, and devotional plans.</p></div>
                        <button onClick={vm.openCreateEditor} className="content-button content-button-primary"><Plus size={16} aria-hidden="true" /> New Journey</button>
                    </header>
                    <CompactOverview vm={vm} />
                    <FilterBar vm={vm} />
                    <section className="content-surface overflow-hidden" aria-label="Journey collection" aria-busy={vm.isLoading}>
                        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
                            <h2 className="font-serif text-xl">Your journeys</h2>
                            <p className="content-muted text-xs" role="status">{vm.isLoading ? 'Loading journeys…' : vm.error ? 'Collection unavailable' : `${vm.filteredJourneys.length} journey${vm.filteredJourneys.length === 1 ? '' : 's'}${vm.hasActiveFilters ? ' matching filters' : ''}`}</p>
                        </div>
                        {vm.isLoading ? <div aria-label="Loading journeys" className="space-y-3 px-5 pb-5">{[0, 1, 2].map(n => <div key={n} className="h-24 animate-pulse rounded-xl bg-soft-linen" />)}</div>
                        : vm.error ? <div role="alert" className="px-5 py-12 text-center"><p className="text-sm text-red-700">{vm.error}</p><button onClick={vm.retry} className="content-button mt-3 underline">Retry loading journeys</button></div>
                        : vm.filteredJourneys.length === 0 ? <div className="px-5 py-12 text-center"><BookOpen size={32} aria-hidden="true" className="mx-auto mb-4 text-deep-teal" /><h3 className="font-serif text-xl">{vm.hasActiveFilters ? 'No journeys match your filters' : 'No journeys yet'}</h3><p className="content-muted mx-auto mt-2 max-w-md text-sm">{vm.hasActiveFilters ? 'Try another search or clear your filters to see all journeys.' : 'Create your first journey and build a series for your congregation.'}</p><button onClick={vm.hasActiveFilters ? vm.clearFilters : vm.openCreateEditor} className="content-button content-button-primary mt-5">{vm.hasActiveFilters ? 'Clear filters' : 'New Journey'}</button></div>
                        : <><div className="content-column-head" aria-hidden="true"><span>Journey</span><span>Type & categories</span><span>Status</span><span>Parts</span><span className="text-right">Actions</span></div><ul>{vm.paginatedJourneys.map(journey => <JourneyRow key={journey.id} journey={journey} vm={vm} />)}</ul><Pagination vm={vm} /></>}
                    </section>
                </main>
            </div>
            {createPortal(<div role={vm.toast?.type === 'error' ? 'alert' : 'status'} aria-live={vm.toast?.type === 'error' ? 'assertive' : 'polite'} aria-atomic="true" className={vm.toast ? `fixed bottom-6 right-6 z-[100] max-w-[calc(100vw-3rem)] rounded-xl px-5 py-3 text-sm font-semibold shadow-xl ${vm.toast.type === 'success' ? 'bg-midnight-teal text-soft-linen' : 'bg-red-700 text-white'}` : 'sr-only'}>{vm.toast?.msg}</div>, document.body)}
            {vm.previewJourney && <JourneyPreview key={vm.previewJourney.id} journey={vm.previewJourney} onClose={vm.closePreview} onEdit={vm.openEditEditor} />}
            {vm.isEditorOpen && (vm.editingJourney ? <JourneyEditor key={vm.editingJourney.id} journey={vm.editingJourney} onClose={vm.closeEditor} onSaved={vm.onJourneySaved} showToast={vm.showToast} /> : <NewJourneyEditor journey={null} onClose={vm.closeEditor} onSaved={vm.onJourneySaved} showToast={vm.showToast} />)}
            <ConfirmArchiveModal open={Boolean(vm.archiveTarget)} itemKind="Journey" itemTitle={vm.archiveTarget?.title ?? ''} isArchiving={Boolean(vm.pendingStatusId)} onCancel={vm.closeArchiveModal} onConfirm={() => void vm.confirmArchive()} />
        </div>
    );
}

function FilterBar({ vm }: { vm: AdminContentViewModel }) {
    return <section className="content-surface space-y-4 p-4" aria-label="Journey filters">
        <div className="content-toolbar">
            <label className="relative"><span className="sr-only">Search journeys by title, description, summary or category</span><Search size={16} aria-hidden="true" className="content-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" /><input className="content-control pl-10" value={vm.search} onChange={e => vm.setSearch(e.target.value)} placeholder="Search journeys…" /></label>
            <label><span className="sr-only">Content type</span><select className="content-control" value={vm.contentTypeFilter} onChange={e => vm.setContentTypeFilter(e.target.value as typeof vm.contentTypeFilter)}><option value="all">All content types</option>{CONTENT_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
            <label><span className="sr-only">Category</span><select className="content-control" disabled={vm.categoryLoading} aria-describedby={vm.categoryLoading || vm.categoryError ? "filter-category-feedback" : undefined} value={vm.categoryFilter} onChange={e => vm.setCategoryFilter(e.target.value)}><option value="all">All categories</option>{Array.from(new Set([...vm.availableCategories, ...(vm.categoryFilter !== 'all' ? [vm.categoryFilter] : [])])).map(c => <option key={c}>{c}</option>)}</select></label>
            <label><span className="sr-only">Sort journeys</span><select className="content-control" value={vm.sort} onChange={e => vm.setSort(e.target.value as JourneySort)}><option value="created">Newest created</option><option value="updated">Recently updated</option><option value="title">Title A–Z</option></select></label>
        </div>
        {vm.categoryLoading && <p id="filter-category-feedback" role="status" className="content-muted text-xs">Loading categories…</p>}
        {vm.categoryError && <p id="filter-category-feedback" role="alert" className="text-xs text-red-700">{vm.categoryError} <button className="content-button underline" onClick={vm.retryCategories}>Retry categories</button></p>}
        <div className="flex flex-wrap items-center gap-2"><span className="content-muted mr-1 text-xs">Status</span>{STATUS_OPTIONS.map(o => <button key={o.value} onClick={() => vm.selectStatusFilter(o.value)} aria-pressed={vm.statusFilter === o.value} title={o.description} className={`min-h-11 ${toggleChipClass(vm.statusFilter === o.value)}`}>{o.label}</button>)}{vm.hasActiveFilters && <button onClick={vm.clearFilters} className="content-button ml-auto"><X size={14} aria-hidden="true" />Clear filters</button>}</div>
    </section>;
}
function Pagination({ vm }: { vm: AdminContentViewModel }) {
    const start = (vm.page - 1) * vm.pageSize + 1;
    return (
        <div className="content-muted flex flex-wrap items-center justify-between gap-3 border-t border-midnight-teal/10 px-5 py-3 text-xs">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <p>Showing {start}–{Math.min(vm.page * vm.pageSize, vm.filteredJourneys.length)} of {vm.filteredJourneys.length}</p>
                <label className="flex items-center gap-2">
                    <span>Journeys per page</span>
                    <select
                        aria-label="Journeys per page"
                        className="content-control content-page-size"
                        value={vm.pageSize}
                        onChange={event => vm.setPageSize(Number(event.target.value))}
                    >
                        <option value={10}>10</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </label>
            </div>
            <div className="flex items-center gap-2">
                <button className="content-button w-11 px-2" disabled={vm.page === 1} onClick={() => vm.setPage(vm.page - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
                <span>Page {vm.page} of {vm.totalPages}</span>
                <button className="content-button w-11 px-2" disabled={vm.page === vm.totalPages} onClick={() => vm.setPage(vm.page + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
            </div>
        </div>
    );
}
