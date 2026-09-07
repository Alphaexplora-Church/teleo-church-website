import { useEffect, useMemo, useState } from 'react';
import type { Journey, JourneyContentType, JourneyStatus } from '../model/adminContent.types';
import { AdminContentService } from '../model/adminContent.service';

export type ToastMessage = { msg: string; type: 'success' | 'error' } | null;

const PAGE_SIZE = 8;

export function useAdminContentViewModel() {
    const [journeys, setJourneys] = useState<Journey[]>([]);
    /**
     * Unfiltered copy of the catalog, loaded once. The stat cards and the
     * category dropdown describe the whole catalog, so they must not read
     * from `journeys` now that it holds a server-filtered subset.
     */
    const [allJourneys, setAllJourneys] = useState<Journey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ─── Search & filter state ────────────────────────────────────────────
    const [search, setSearch] = useState('');
    /** Multi-select lifecycle filter. Empty array = no restriction (all statuses shown). */
    const [statusFilter, setStatusFilter] = useState<JourneyStatus[]>([]);
    const [contentTypeFilter, setContentTypeFilter] = useState<'all' | JourneyContentType>('all');
    const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');

    // ─── Pagination state ─────────────────────────────────────────────────
    const [page, setPage] = useState(1);

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingJourney, setEditingJourney] = useState<Journey | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Journey | null>(null);
    /** Journey pending confirmation before the (destructive-to-visibility) Archive action fires. Restore has no confirmation — it's non-destructive. */
    const [archiveTarget, setArchiveTarget] = useState<Journey | null>(null);
    const [toast, setToast] = useState<ToastMessage>(null);

    /** Id of the journey whose Archive/Restore action is in flight, so its row can show a spinner instead of doing nothing. */
    const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        window.setTimeout(() => setToast(null), 3000);
    };

    /** Debounced copy of `search`, so typing does not fire a request per keystroke. */
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
        return () => window.clearTimeout(timer);
    }, [search]);

    /**
     * The API accepts a single `status`, so it is only sent when exactly one
     * is selected. Zero or multiple means fetch unrestricted and narrow the
     * result client-side below.
     */
    const load = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const items = await AdminContentService.fetchJourneys({
                search: debouncedSearch || undefined,
                status: statusFilter.length === 1 ? statusFilter[0] : undefined,
                contentType: contentTypeFilter === 'all' ? undefined : contentTypeFilter,
                category: categoryFilter === 'all' ? undefined : categoryFilter,
            });
            setJourneys(items);
        } catch {
            setError('Could not load journeys.');
        } finally {
            setIsLoading(false);
        }
    };

    /** Unfiltered catalog for the stat cards and the category dropdown. */
    const loadAll = async () => {
        try {
            setAllJourneys(await AdminContentService.fetchJourneys());
        } catch {
            // Non-fatal: the list itself still renders, only the counters go stale.
        }
    };

    useEffect(() => { void loadAll(); }, []);

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, statusFilter, contentTypeFilter, categoryFilter]);

    // Reset to page 1 whenever any filter/search input changes, so the user
    // never lands on a now-out-of-range page.
    useEffect(() => { setPage(1); }, [search, statusFilter, contentTypeFilter, categoryFilter]);

    /**
     * Server-side filtering covers search, content type, category, and a
     * single status. Only the multi-status case still needs narrowing here.
     */
    const filteredJourneys = useMemo(
        () => statusFilter.length > 1
            ? journeys.filter(journey => statusFilter.includes(journey.status))
            : journeys,
        [journeys, statusFilter],
    );

    const totalPages = Math.max(1, Math.ceil(filteredJourneys.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paginatedJourneys = filteredJourneys.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    /** All categories in the catalog, for populating the Category filter dropdown. */
    const availableCategories = useMemo(
        () => Array.from(new Set(allJourneys.flatMap(journey => journey.categories))).sort(),
        [allJourneys],
    );

    const stats = [
        { label: 'Total journeys', value: allJourneys.length },
        { label: 'Published', value: allJourneys.filter(j => j.status === 'published').length, accent: true },
        { label: 'Drafts', value: allJourneys.filter(j => j.status === 'draft').length },
    ];

    const toggleStatusFilter = (status: JourneyStatus) => {
        setStatusFilter(current =>
            current.includes(status) ? current.filter(item => item !== status) : [...current, status],
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter([]);
        setContentTypeFilter('all');
        setCategoryFilter('all');
    };

    const hasActiveFilters = search.trim() !== '' || statusFilter.length > 0 || contentTypeFilter !== 'all' || categoryFilter !== 'all';

    const applyStatus = async (journey: Journey, status: JourneyStatus) => {
        const previousStatus = journey.status;
        setPendingStatusId(journey.id);
        // Optimistic update: reflect the new status immediately instead
        // of leaving the row looking frozen for the ~250ms round trip.
        setJourneys(current => current.map(item => item.id === journey.id ? { ...item, status } : item));
        try {
            const updated = await AdminContentService.setStatus(journey.id, status);
            setJourneys(current => current.map(item => item.id === updated.id ? updated : item));
            showToast(
                status === 'archived'
                    ? `“${updated.title}” archived.`
                    : `“${updated.title}” moved to ${status}.`,
            );
        } catch {
            // Roll back the optimistic change.
            setJourneys(current => current.map(item => item.id === journey.id ? { ...item, status: previousStatus } : item));
            showToast('Failed to update journey status.', 'error');
        } finally {
            setPendingStatusId(null);
        }
    };

    return {
        journeys, filteredJourneys, paginatedJourneys, isLoading, error,
        search, setSearch,
        statusFilter, toggleStatusFilter,
        contentTypeFilter, setContentTypeFilter,
        categoryFilter, setCategoryFilter,
        availableCategories,
        hasActiveFilters, clearFilters,

        page: safePage, totalPages, setPage,
        pageSize: PAGE_SIZE,

        stats, toast, showToast, retry: () => { void load(); },

        isEditorOpen, editingJourney,
        openCreateEditor: () => { setEditingJourney(null); setIsEditorOpen(true); },
        openEditEditor: (journey: Journey) => { setEditingJourney(journey); setIsEditorOpen(true); },
        closeEditor: () => { setIsEditorOpen(false); setEditingJourney(null); },

        deleteTarget, openDeleteModal: setDeleteTarget, closeDeleteModal: () => { if (!isDeleting) setDeleteTarget(null); },
        isDeleting,
        handleDelete: async () => {
            if (!deleteTarget) return;
            setIsDeleting(true);
            try {
                await AdminContentService.deleteJourney(deleteTarget.id);
                setJourneys(current => current.filter(item => item.id !== deleteTarget.id));
                showToast(`“${deleteTarget.title}” deleted.`);
                // Only dismiss on success — on failure the modal stays open
                // (with the spinner cleared) so the user can just retry.
                setDeleteTarget(null);
            } catch {
                showToast('Failed to delete journey.', 'error');
            } finally {
                setIsDeleting(false);
            }
        },

        /** Quick list-view action: archive a journey (or restore an archived one back to draft). */
        pendingStatusId,
        handleSetStatus: (journey: Journey, status: JourneyStatus) => applyStatus(journey, status),

        /** Archive requires a confirmation step first (spec: downstream effects on Member completion/visibility must be surfaced before it fires). Restore stays a direct one-click action since it's non-destructive. */
        archiveTarget,
        openArchiveModal: setArchiveTarget,
        closeArchiveModal: () => setArchiveTarget(null),
        confirmArchive: async () => {
            if (!archiveTarget) return;
            const target = archiveTarget;
            setArchiveTarget(null);
            await applyStatus(target, 'archived');
        },

        onJourneySaved: (journey: Journey, isNew: boolean) => {
            setJourneys(current => isNew ? [journey, ...current] : current.map(item => item.id === journey.id ? journey : item));
        },
    };
}

export type AdminContentViewModel = ReturnType<typeof useAdminContentViewModel>;
