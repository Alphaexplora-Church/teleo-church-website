import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AdminContentService, fetchCategoryCatalog } from '../model/adminContent.service';
import type { Journey, JourneyContentType, JourneySort, JourneyStatus } from '../model/adminContent.types';
import { sortJourneys } from '../model/contentCollection';

export type ToastMessage = { msg: string; type: 'success' | 'error' } | null;
type DetailCount = { updatedAt: string; total?: number; error?: string };

export function useAdminContentViewModel() {
    const [journeys, setJourneys] = useState<Journey[]>([]);
    const [allJourneys, setAllJourneys] = useState<Journey[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [overviewError, setOverviewError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<JourneyStatus | null>(null);
    const [contentTypeFilter, setContentTypeFilter] = useState<'all' | JourneyContentType>('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [categoryLoading, setCategoryLoading] = useState(true);
    const [categoryError, setCategoryError] = useState<string | null>(null);
    const [categoryRevision, setCategoryRevision] = useState(0);
    const [sort, setSort] = useState<JourneySort>('created');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<10 | 50 | 100>(10);
    const [revision, setRevision] = useState(0);
    const [detailRevision, setDetailRevision] = useState(0);
    const [detailCounts, setDetailCounts] = useState<Record<string, DetailCount>>({});
    const detailCache = useRef<Record<string, DetailCount>>({});
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingJourney, setEditingJourney] = useState<Journey | null>(null);
    const [previewJourney, setPreviewJourney] = useState<Journey | null>(null);
    const [archiveTarget, setArchiveTarget] = useState<Journey | null>(null);
    const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);
    const [toast, setToast] = useState<ToastMessage>(null);
    const toastTimer = useRef<number | undefined>(undefined);

    const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
        window.clearTimeout(toastTimer.current);
        setToast({ msg, type });
        toastTimer.current = window.setTimeout(() => setToast(null), 5000);
    }, []);
    useEffect(() => () => window.clearTimeout(toastTimer.current), []);
    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
        return () => window.clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setCategoryLoading(true);
            setCategoryError(null);
            try {
                const catalog = await fetchCategoryCatalog();
                if (!cancelled) setAvailableCategories(catalog.map(category => category.name));
            } catch {
                if (!cancelled) setCategoryError('Could not load the category catalog.');
            } finally {
                if (!cancelled) setCategoryLoading(false);
            }
        };
        void load();
        return () => { cancelled = true; };
    }, [categoryRevision]);

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const items = await AdminContentService.fetchJourneys({
                    search: debouncedSearch || undefined,
                    status: statusFilter ?? undefined,
                    contentType: contentTypeFilter === 'all' ? undefined : contentTypeFilter,
                    category: categoryFilter === 'all' ? undefined : categoryFilter,
                }, controller.signal);
                if (!controller.signal.aborted) setJourneys(items);
            } catch (err) {
                if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Could not load journeys.');
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        };
        void load();
        return () => controller.abort();
    }, [debouncedSearch, statusFilter, contentTypeFilter, categoryFilter, revision]);

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            setAllJourneys(null);
            setOverviewError(null);
            try {
                const items = await AdminContentService.fetchJourneys({}, controller.signal);
                if (!controller.signal.aborted) setAllJourneys(items);
            } catch {
                if (!controller.signal.aborted) setOverviewError('Overview unavailable.');
            }
        };
        void load();
        return () => controller.abort();
    }, [revision]);

    const filteredJourneys = useMemo(() => sortJourneys(journeys, sort), [journeys, sort]);
    const totalPages = Math.max(1, Math.ceil(filteredJourneys.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const paginatedJourneys = useMemo(() => filteredJourneys.slice((safePage - 1) * pageSize, safePage * pageSize), [filteredJourneys, safePage, pageSize]);

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            await Promise.all(paginatedJourneys.map(async journey => {
                const cached = detailCache.current[journey.id];
                if (cached?.updatedAt === journey.updatedAt) return;
                try {
                    const detail = await AdminContentService.fetchJourneyDetail(journey.id, { signal: controller.signal, previews: false });
                    if (controller.signal.aborted) return;
                    const entry = { updatedAt: journey.updatedAt, total: detail.parts.length };
                    detailCache.current[journey.id] = entry;
                    setDetailCounts(current => ({ ...current, [journey.id]: entry }));
                } catch {
                    if (controller.signal.aborted) return;
                    const entry = { updatedAt: journey.updatedAt, error: 'Count unavailable' };
                    detailCache.current[journey.id] = entry;
                    setDetailCounts(current => ({ ...current, [journey.id]: entry }));
                }
            }));
        };
        if (!isLoading && !error) void load();
        return () => controller.abort();
    }, [paginatedJourneys, isLoading, error, detailRevision]);

    const refresh = () => {
        detailCache.current = {};
        setDetailCounts({});
        setRevision(value => value + 1);
    };
    const stats = [
        { label: 'Total journeys', value: allJourneys?.length },
        { label: 'Published', value: allJourneys?.filter(j => j.status === 'published').length, accent: true },
        { label: 'Drafts', value: allJourneys?.filter(j => j.status === 'draft').length },
    ];
    const hasActiveFilters = Boolean(search.trim() || statusFilter || contentTypeFilter !== 'all' || categoryFilter !== 'all');
    const clearFilters = () => { setSearch(''); setStatusFilter(null); setContentTypeFilter('all'); setCategoryFilter('all'); setPage(1); };
    const openEditEditor = (journey: Journey) => { setPreviewJourney(null); setEditingJourney(journey); setIsEditorOpen(true); };
    const applyStatus = async (journey: Journey, status: JourneyStatus) => {
        if (pendingStatusId) return;
        setPendingStatusId(journey.id);
        try {
            const updated = await AdminContentService.setStatus(journey.id, status);
            showToast(`“${updated.title}” ${status === 'archived' ? 'archived.' : 'is live again.'}`);
            setArchiveTarget(null);
            refresh();
        } catch (err) { showToast(err instanceof Error ? err.message : 'Failed to update journey status.', 'error'); }
        finally { setPendingStatusId(null); }
    };

    return {
        journeys, filteredJourneys, paginatedJourneys, isLoading, error,
        search, setSearch: (value: string) => { setSearch(value); setPage(1); },
        statusFilter, selectStatusFilter: (status: JourneyStatus) => { setStatusFilter(status); setPage(1); },
        contentTypeFilter, setContentTypeFilter: (value: 'all' | JourneyContentType) => { setContentTypeFilter(value); setPage(1); },
        categoryFilter, setCategoryFilter: (value: string) => { setCategoryFilter(value); setPage(1); },
        sort, setSort: (value: JourneySort) => { setSort(value); setPage(1); },
        availableCategories, categoryLoading, categoryError, retryCategories: () => setCategoryRevision(value => value + 1),
        overviewError, hasActiveFilters, clearFilters,
        page: safePage, totalPages, setPage, pageSize,
        setPageSize: (value: number) => { if (value === 10 || value === 50 || value === 100) { setPageSize(value); setPage(1); } },
        stats, toast, showToast, retry: refresh,
        detailCounts, retryDetail: (id: string) => { delete detailCache.current[id]; setDetailCounts(current => { const next = { ...current }; delete next[id]; return next; }); setDetailRevision(value => value + 1); },
        previewJourney, openPreview: setPreviewJourney, closePreview: () => setPreviewJourney(null),
        isEditorOpen, editingJourney, openEditEditor,
        openCreateEditor: () => { setEditingJourney(null); setIsEditorOpen(true); },
        closeEditor: () => { setIsEditorOpen(false); setEditingJourney(null); },
        pendingStatusId, handleSetStatus: applyStatus, archiveTarget, openArchiveModal: setArchiveTarget,
        closeArchiveModal: () => { if (!pendingStatusId) setArchiveTarget(null); },
        confirmArchive: () => archiveTarget ? applyStatus(archiveTarget, 'archived') : Promise.resolve(),
        onJourneySaved: () => refresh(),
    };
}

export type AdminContentViewModel = ReturnType<typeof useAdminContentViewModel>;
