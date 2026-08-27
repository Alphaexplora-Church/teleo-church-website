// ─── Admin Content — AdminContentView (View) ────────────────────────────────
// Phase 0: Journey Management List & Filter View.
// Paginated list of journeys/series with Title/Content Type/Category badges,
// a real-time title search, a Content Type filter, a Category filter, and a
// multi-select Status filter (Draft / Published / Archived).
import { useEffect, useState } from 'react';
import { Archive, BookOpen, ChevronLeft, ChevronRight, Layers, Loader2, Pencil, Plus, RotateCcw, Search, Trash2, X } from 'lucide-react';
import AdminHeader from '../../../../shared/components/AdminHeader';
import AdminSidebar from '../../../../shared/components/AdminSidebar';
import { CONTENT_TYPE_OPTIONS, STATUS_OPTIONS } from '../model/adminContent.types';
import type { Journey } from '../model/adminContent.types';
import type { ToastMessage } from '../viewmodel/useAdminContentViewModel';
import { useAdminContentViewModel } from '../viewmodel/useAdminContentViewModel';
import { ConfirmArchiveModal } from './ConfirmArchiveModal';
import { ConfirmDeleteJourneyModal } from './ConfirmDeleteJourneyModal';
import { JourneyEditor } from './JourneyEditor';
import { iconButtonClass, statusBadgeClass, toggleChipClass, type IconButtonVariant } from './contentStyles';

const CONTENT_TYPE_LABELS: Record<string, string> = Object.fromEntries(
    CONTENT_TYPE_OPTIONS.map(option => [option.value, option.label]),
);

export default function AdminContentView() {
    const vm = useAdminContentViewModel();

    return (
        <div className="admin-shell flex flex-col lg:flex-row">
            <AdminSidebar />
            <div className="relative z-10 flex flex-1 flex-col">
                <AdminHeader />
                <main className="admin-main mx-auto w-full max-w-7xl flex-1 space-y-6 px-6 py-8 lg:px-10">
                    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="font-serif text-2xl text-midnight-teal">Journeys</h1>
                            <p className="mt-0.5 text-sm text-gray-400">Build and publish sermon series, bible studies, and devotional plans.</p>
                        </div>
                        <button onClick={vm.openCreateEditor} className="flex items-center justify-center gap-2 rounded-xl bg-midnight-teal px-5 py-2.5 text-sm font-bold text-soft-linen shadow transition-colors hover:bg-deep-teal">
                            <Plus size={16} /> New Journey
                        </button>
                    </header>

                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Journey overview">
                        {vm.stats.map(stat => (
                            <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
                                <p className={`font-serif text-3xl ${stat.accent ? 'text-harvest-orange' : 'text-midnight-teal'}`}>{stat.value}</p>
                            </div>
                        ))}
                    </section>

                    <FilterBar vm={vm} />

                    {vm.isLoading ? (
                        <div className="flex flex-col gap-3 animate-fade-in">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl border border-gray-100 bg-white" />)}</div>
                    ) : vm.error ? (
                        <div className="animate-fade-in rounded-2xl border border-red-200 bg-red-50 p-6 text-center"><p className="text-sm font-semibold text-red-500">{vm.error}</p><button onClick={vm.retry} className="mt-3 text-xs font-bold text-midnight-teal underline">Retry</button></div>
                    ) : vm.filteredJourneys.length === 0 ? (
                        <EmptyState hasActiveFilters={vm.hasActiveFilters} onClearFilters={vm.clearFilters} />
                    ) : (
                        <>
                            {/* Keying on page + filters replays the entrance animation whenever
                                the visible set of journeys actually changes, giving pagination
                                and filtering a light, responsive transition instead of an
                                instant swap. */}
                            <div key={`${vm.page}-${vm.search}-${vm.contentTypeFilter}-${vm.categoryFilter}-${vm.statusFilter.join(',')}`} className="flex flex-col gap-3">
                                {vm.paginatedJourneys.map((journey, index) => (
                                    <div key={journey.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(index * 35, 210)}ms` }}>
                                        <JourneyCard
                                            journey={journey}
                                            isPending={vm.pendingStatusId === journey.id}
                                            onEdit={() => vm.openEditEditor(journey)}
                                            onDelete={() => vm.openDeleteModal(journey)}
                                            onArchive={() => vm.openArchiveModal(journey)}
                                            onRestore={() => void vm.handleSetStatus(journey, 'draft')}
                                        />
                                    </div>
                                ))}
                            </div>
                            <Pagination
                                page={vm.page}
                                totalPages={vm.totalPages}
                                total={vm.filteredJourneys.length}
                                pageSize={vm.pageSize}
                                onChange={vm.setPage}
                            />
                        </>
                    )}
                </main>
            </div>

            <Toast toast={vm.toast} />

            {vm.isEditorOpen && (
                <JourneyEditor
                    key={vm.editingJourney?.id ?? 'new'}
                    journey={vm.editingJourney}
                    onClose={vm.closeEditor}
                    onSaved={vm.onJourneySaved}
                    showToast={vm.showToast}
                />
            )}

            <ConfirmDeleteJourneyModal
                open={Boolean(vm.deleteTarget)}
                journeyTitle={vm.deleteTarget?.title ?? ''}
                isDeleting={vm.isDeleting}
                onCancel={vm.closeDeleteModal}
                onConfirm={() => void vm.handleDelete()}
            />

            <ConfirmArchiveModal
                open={Boolean(vm.archiveTarget)}
                itemKind="Journey"
                itemTitle={vm.archiveTarget?.title ?? ''}
                isArchiving={vm.pendingStatusId === vm.archiveTarget?.id}
                onCancel={vm.closeArchiveModal}
                onConfirm={() => void vm.confirmArchive()}
            />
        </div>
    );
}

// ─── Toast ────────────────────────────────────────────────────────────────
// Stays mounted briefly after `toast` clears so it can slide/fade out
// instead of disappearing mid-frame.
function Toast({ toast }: { toast: ToastMessage }) {
    const [shouldRender, setShouldRender] = useState(false);
    const [visible, setVisible] = useState(false);
    const [content, setContent] = useState(toast);

    useEffect(() => {
        if (toast) {
            // Reveal-after-mount pattern (see useModalTransition) — not
            // state synchronization, so intentionally opting out of the rule.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setContent(toast);
            setShouldRender(true);
            const raf = requestAnimationFrame(() => setVisible(true));
            return () => cancelAnimationFrame(raf);
        }
        setVisible(false);
        const timeout = window.setTimeout(() => setShouldRender(false), 200);
        return () => window.clearTimeout(timeout);
    }, [toast]);

    if (!shouldRender || !content) return null;

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 rounded-xl px-5 py-3 text-sm font-semibold shadow-xl transition-all duration-200 ease-out ${
                visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            } ${content.type === 'success' ? 'bg-midnight-teal text-soft-linen' : 'bg-red-500 text-white'}`}
        >
            {content.msg}
        </div>
    );
}

// ─── Search & Filtering Controls ─────────────────────────────────────────
function FilterBar({ vm }: { vm: ReturnType<typeof useAdminContentViewModel> }) {
    return (
        <section className="space-y-3 rounded-2xl border border-white/70 bg-white/75 p-3 shadow-sm backdrop-blur-md" aria-label="Journey filters">
            <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_auto_auto]">
                {/* Title Search: real-time text input */}
                <div className="relative">
                    <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-midnight-teal/45" />
                    <input
                        value={vm.search}
                        onChange={e => vm.setSearch(e.target.value)}
                        placeholder="Search by title or category…"
                        aria-label="Search journeys by title"
                        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-midnight-teal/30"
                    />
                </div>

                {/* Content Type Filter */}
                <label className="block">
                    <span className="sr-only">Content type</span>
                    <select
                        aria-label="Content type"
                        value={vm.contentTypeFilter}
                        onChange={e => vm.setContentTypeFilter(e.target.value as typeof vm.contentTypeFilter)}
                        className="h-full min-h-11 w-full min-w-[11rem] rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-midnight-teal outline-none focus:ring-2 focus:ring-midnight-teal/30"
                    >
                        <option value="all">All content types</option>
                        {CONTENT_TYPE_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </label>

                {/* Category Filter */}
                <label className="block">
                    <span className="sr-only">Category</span>
                    <select
                        aria-label="Category"
                        value={vm.categoryFilter}
                        onChange={e => vm.setCategoryFilter(e.target.value)}
                        className="h-full min-h-11 w-full min-w-[11rem] rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-midnight-teal outline-none focus:ring-2 focus:ring-midnight-teal/30"
                    >
                        <option value="all">All categories</option>
                        {vm.availableCategories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </label>
            </div>

            {/* Status Filter: multi-option selection (Draft / Published / Archived) */}
            <div className="flex flex-wrap items-center gap-2 px-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-midnight-teal/50">Status</span>
                {STATUS_OPTIONS.map(option => {
                    const active = vm.statusFilter.includes(option.value);
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => vm.toggleStatusFilter(option.value)}
                            aria-pressed={active}
                            title={option.description}
                            className={toggleChipClass(active)}
                        >
                            {option.label}
                        </button>
                    );
                })}
                {vm.hasActiveFilters && (
                    <button
                        type="button"
                        onClick={vm.clearFilters}
                        className="ml-auto flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-midnight-teal/50 hover:text-midnight-teal"
                    >
                        <X size={12} /> Clear filters
                    </button>
                )}
            </div>
        </section>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────
function Pagination({ page, totalPages, total, pageSize, onChange }: { page: number; totalPages: number; total: number; pageSize: number; onChange: (page: number) => void }) {
    if (totalPages <= 1) return null;

    const rangeStart = (page - 1) * pageSize + 1;
    const rangeEnd = Math.min(page * pageSize, total);

    return (
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm sm:flex-row">
            <p className="text-xs font-semibold text-gray-400">
                Showing <span className="text-midnight-teal">{rangeStart}–{rangeEnd}</span> of <span className="text-midnight-teal">{total}</span>
            </p>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onChange(page - 1)}
                    disabled={page <= 1}
                    aria-label="Previous page"
                    className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 text-midnight-teal transition-colors hover:bg-midnight-teal/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronLeft size={16} />
                </button>
                <span className="min-w-[5.5rem] text-center text-xs font-bold uppercase tracking-widest text-midnight-teal/70">
                    Page {page} of {totalPages}
                </span>
                <button
                    type="button"
                    onClick={() => onChange(page + 1)}
                    disabled={page >= totalPages}
                    aria-label="Next page"
                    className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 text-midnight-teal transition-colors hover:bg-midnight-teal/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}

function JourneyCard({ journey, isPending, onEdit, onDelete, onArchive, onRestore }: {
    journey: Journey;
    isPending: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onArchive: () => void;
    onRestore: () => void;
}) {
    const publishedParts = journey.parts.filter(part => part.status === 'published').length;

    return (
        <article className={`group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md ${isPending ? 'opacity-70' : 'opacity-100'}`}>
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-soft-linen">
                <BookOpen className="text-midnight-teal/50" size={24} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-serif text-base font-semibold text-midnight-teal">{journey.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 ${statusBadgeClass(journey.status)}`}>{journey.status}</span>
                    <span className="rounded-full bg-midnight-teal/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-midnight-teal/60">
                        {CONTENT_TYPE_LABELS[journey.contentType] ?? journey.contentType}
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Layers size={12} /> {journey.parts.length} part{journey.parts.length === 1 ? '' : 's'} · {publishedParts} published</span>
                    {journey.categories.length > 0 && <span>{journey.categories.join(', ')}</span>}
                </div>
                {(journey.summary || journey.description) && <p className="mt-1 line-clamp-1 text-xs text-gray-400">{journey.summary || journey.description}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-1">
                <IconButton title="Edit" onClick={onEdit} disabled={isPending}><Pencil size={16} /></IconButton>
                {journey.status === 'archived' ? (
                    <IconButton title="Restore to draft" onClick={onRestore} disabled={isPending} loading={isPending} variant="warn"><RotateCcw size={16} /></IconButton>
                ) : (
                    <IconButton title="Archive" onClick={onArchive} disabled={isPending} loading={isPending} variant="warn"><Archive size={16} /></IconButton>
                )}
                <IconButton title="Delete" onClick={onDelete} disabled={isPending} variant="danger"><Trash2 size={16} /></IconButton>
            </div>
        </article>
    );
}

function IconButton({ title, onClick, variant = 'default', disabled = false, loading = false, children }: { title: string; onClick: () => void; variant?: IconButtonVariant; disabled?: boolean; loading?: boolean; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            title={title}
            aria-label={title}
            disabled={disabled}
            className={`grid h-9 w-9 place-items-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${iconButtonClass(variant)}`}
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : children}
        </button>
    );
}

function EmptyState({ hasActiveFilters, onClearFilters }: { hasActiveFilters: boolean; onClearFilters: () => void }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-soft-linen"><BookOpen className="text-midnight-teal/40" size={28} /></div>
            {hasActiveFilters ? (
                <>
                    <p className="font-serif text-lg text-midnight-teal">No journeys match your filters</p>
                    <p className="mt-1 text-sm text-gray-400">Try a different search term or clear your filters.</p>
                    <button onClick={onClearFilters} className="mt-4 text-xs font-bold text-midnight-teal underline">Clear filters</button>
                </>
            ) : (
                <>
                    <p className="font-serif text-lg text-midnight-teal">No journeys yet</p>
                    <p className="mt-1 text-sm text-gray-400">Create a new journey to start building a series for your congregation.</p>
                </>
            )}
        </div>
    );
}
