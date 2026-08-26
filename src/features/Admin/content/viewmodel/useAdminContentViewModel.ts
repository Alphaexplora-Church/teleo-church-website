import { useEffect, useMemo, useState } from 'react';
import type { Journey, JourneyContentType, JourneyStatus } from '../model/adminContent.types';
import { AdminContentService } from '../model/adminContent.service';

export type ToastMessage = { msg: string; type: 'success' | 'error' } | null;

const PAGE_SIZE = 8;

export function useAdminContentViewModel() {
    const [journeys, setJourneys] = useState<Journey[]>([]);
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
    const [toast, setToast] = useState<ToastMessage>(null);

    /** Id of the journey whose Archive/Restore action is in flight, so its row can show a spinner instead of doing nothing. */
    const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        window.setTimeout(() => setToast(null), 3000);
    };

    const load = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const items = await AdminContentService.fetchJourneys();
            setJourneys(items);
        } catch {
            setError('Could not load journeys.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { void load(); }, []);

    // Reset to page 1 whenever any filter/search input changes, so the user
    // never lands on a now-out-of-range page.
    useEffect(() => { setPage(1); }, [search, statusFilter, contentTypeFilter, categoryFilter]);

    const query = search.trim().toLowerCase();

    const filteredJourneys = useMemo(() => journeys
        .filter(journey => statusFilter.length === 0 || statusFilter.includes(journey.status))
        .filter(journey => contentTypeFilter === 'all' || journey.contentType === contentTypeFilter)
        .filter(journey => categoryFilter === 'all' || journey.categories.includes(categoryFilter))
        .filter(journey =>
            query === '' ||
            journey.title.toLowerCase().includes(query) ||
            journey.categories.some(category => category.toLowerCase().includes(query)),
        ), [journeys, statusFilter, contentTypeFilter, categoryFilter, query]);

    const totalPages = Math.max(1, Math.ceil(filteredJourneys.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paginatedJourneys = filteredJourneys.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    /** All categories currently in use, for populating the Category filter dropdown. */
    const availableCategories = useMemo(
        () => Array.from(new Set(journeys.flatMap(journey => journey.categories))).sort(),
        [journeys],
    );

    const stats = [
        { label: 'Total journeys', value: journeys.length },
        { label: 'Published', value: journeys.filter(j => j.status === 'published').length, accent: true },
        { label: 'Drafts', value: journeys.filter(j => j.status === 'draft').length },
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
        handleSetStatus: async (journey: Journey, status: JourneyStatus) => {
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
        },

        onJourneySaved: (journey: Journey, isNew: boolean) => {
            setJourneys(current => isNew ? [journey, ...current] : current.map(item => item.id === journey.id ? journey : item));
        },
    };
}

export type AdminContentViewModel = ReturnType<typeof useAdminContentViewModel>;
