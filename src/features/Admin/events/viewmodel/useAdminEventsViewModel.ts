import { useEffect, useState } from 'react';
import type { Announcement, AdminContentStats, ChurchEvent, ContentItem } from '../model/content.types';
import type { ContentSort, ContentStatusFilter, ContentTab, EventFormData } from '../model/adminEvents.types';
import { AdminEventsService } from '../model/adminEvents.service';

export interface AdminEventsViewModel {
    activeTab: ContentTab;
    setActiveTab: (tab: ContentTab) => void;
    events: ChurchEvent[];
    announcements: Announcement[];
    filteredEvents: ChurchEvent[];
    filteredAnnouncements: Announcement[];
    isLoading: boolean;
    error: string | null;
    search: string;
    setSearch: (value: string) => void;
    statusFilter: ContentStatusFilter;
    setStatusFilter: (value: ContentStatusFilter) => void;
    categoryFilter: string;
    setCategoryFilter: (value: string) => void;
    sort: ContentSort;
    setSort: (value: ContentSort) => void;
    categories: string[];
    stats: Array<{ label: string; value: number; accent?: boolean }>;
    showModal: boolean;
    editTarget: ContentItem | null;
    deleteTarget: ContentItem | null;
    previewTarget: ContentItem | null;
    toast: { msg: string; type: 'success' | 'error' } | null;
    openCreateModal: () => void;
    openEditModal: (item: ContentItem) => void;
    closeModal: () => void;
    openDeleteModal: (item: ContentItem) => void;
    closeDeleteModal: () => void;
    openPreviewModal: (item: ContentItem) => void;
    closePreviewModal: () => void;
    handleSave: (data: EventFormData) => Promise<void>;
    handleDelete: () => Promise<void>;
    retry: () => void;
    page: number;
    nextPage: () => void;
    prevPage: () => void;
    hasMore: boolean;
}

const itemDateValue = (item: ContentItem, preferCreatedAt = false) => {
    if (preferCreatedAt && item.created_at) return new Date(item.created_at).getTime() || 0;
    if (!item.start_date) return 0;
    return new Date(`${item.start_date.date} ${item.start_date.time}`).getTime() || 0;
};

export function useAdminEventsViewModel(): AdminEventsViewModel {
    const [activeTab, setActiveTab] = useState<ContentTab>('event');
    const [events, setEvents] = useState<ChurchEvent[]>([]);
    const [eventsTotal, setEventsTotal] = useState(0);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [announcementsTotal, setAnnouncementsTotal] = useState(0);
    const [apiStats, setApiStats] = useState<AdminContentStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<ContentStatusFilter>('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sort, setSort] = useState<ContentSort>('date-asc');
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState<ContentItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);
    const [previewTarget, setPreviewTarget] = useState<ContentItem | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const limit = 10;

    const loadAll = async (currentPage: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const [eventsResult, announcementsResult, statsResult] = await Promise.all([
                AdminEventsService.fetchEvents(currentPage, limit),
                AdminEventsService.fetchAnnouncements(currentPage, limit),
                AdminEventsService.fetchStats().catch(() => null),
            ]);
            setEvents(eventsResult.items);
            setEventsTotal(eventsResult.total);
            setAnnouncements(announcementsResult.items);
            setAnnouncementsTotal(announcementsResult.total);
            setApiStats(statsResult);
        } catch {
            setError('Could not load content. Make sure the backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadAll(page);
    }, [page]);

    useEffect(() => {
        setSearch('');
        setStatusFilter('all');
        setCategoryFilter('all');
        setSort(activeTab === 'event' ? 'date-asc' : 'newest');
        setPage(1);
    }, [activeTab]);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        window.setTimeout(() => setToast(null), 3000);
    };

    const query = search.trim().toLowerCase();
    const filterAndSort = <T extends ContentItem>(items: T[], matchesSearch: (item: T) => boolean) =>
        items
            .filter(matchesSearch)
            .filter(item => statusFilter === 'all' || (item.status || 'active') === statusFilter)
            .filter(item => categoryFilter === 'all' || item.category_content === categoryFilter)
            .sort((a, b) => {
                if (sort === 'title') return a.title.localeCompare(b.title);
                if (sort === 'newest') return itemDateValue(b, true) - itemDateValue(a, true);
                if (sort === 'date-desc') return itemDateValue(b) - itemDateValue(a);
                return itemDateValue(a) - itemDateValue(b);
            });

    const filteredEvents = filterAndSort(events, event =>
        event.title.toLowerCase().includes(query) ||
        (event.location ?? '').toLowerCase().includes(query) ||
        (event.category_content ?? '').toLowerCase().includes(query),
    );
    const filteredAnnouncements = filterAndSort(announcements, announcement =>
        announcement.title.toLowerCase().includes(query) ||
        (announcement.category_content ?? '').toLowerCase().includes(query) ||
        (announcement.description ?? '').toLowerCase().includes(query),
    );

    const activeItems = activeTab === 'event' ? events : announcements;
    const categories = [...new Set(
        activeItems.map(item => item.category_content).filter((value): value is string => Boolean(value)),
    )].sort();
    const stats = activeTab === 'event'
        ? [
            { label: 'Upcoming this month', value: apiStats?.events.upcomingMonth ?? events.filter(item => item.status === 'active').length },
            { label: 'Happening this week', value: apiStats?.events.thisWeek ?? 0, accent: true },
            { label: 'Completed this month', value: apiStats?.events.completedMonth ?? events.filter(item => item.status === 'completed').length },
        ]
        : [
            { label: 'Currently active', value: apiStats?.announcements.activeLive ?? announcementsTotal },
            { label: 'Posted this month', value: apiStats?.announcements.postedThisMonth ?? 0, accent: true },
            { label: 'Active categories', value: apiStats?.announcements.activeCategories ?? categories.length },
        ];

    const closeModal = () => { setShowModal(false); setEditTarget(null); };
    const handleSave = async (data: EventFormData) => {
        try {
            if (editTarget) {
                await AdminEventsService.updateEvent(editTarget.id, data, activeTab);
                showToast(`“${data.title}” updated successfully.`);
            } else {
                await AdminEventsService.createEvent(data, activeTab);
                showToast(`“${data.title}” created.`);
            }
            closeModal();
            await loadAll(page);
        } catch (saveError: unknown) {
            const message = saveError instanceof Error ? saveError.message : 'Unknown error';
            showToast(`Failed to save: ${message}`, 'error');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await AdminEventsService.archiveContent(deleteTarget.id);
            if (activeTab === 'announcement') setAnnouncements(current => current.filter(item => item.id !== deleteTarget.id));
            else setEvents(current => current.filter(item => item.id !== deleteTarget.id));
            showToast(`“${deleteTarget.title}” archived.`);
            setDeleteTarget(null);
        } catch {
            showToast('Failed to archive content.', 'error');
        }
    };

    return {
        activeTab, setActiveTab, events, announcements, filteredEvents, filteredAnnouncements,
        isLoading, error, search, setSearch, statusFilter, setStatusFilter, categoryFilter,
        setCategoryFilter, sort, setSort, categories, stats, showModal, editTarget, deleteTarget,
        previewTarget, toast,
        openCreateModal: () => { setEditTarget(null); setShowModal(true); },
        openEditModal: item => { setEditTarget(item); setShowModal(true); },
        closeModal,
        openDeleteModal: setDeleteTarget,
        closeDeleteModal: () => setDeleteTarget(null),
        openPreviewModal: setPreviewTarget,
        closePreviewModal: () => setPreviewTarget(null),
        handleSave,
        handleDelete,
        retry: () => { void loadAll(page); },
        page,
        nextPage: () => setPage(current => current + 1),
        prevPage: () => setPage(current => Math.max(1, current - 1)),
        hasMore: activeTab === 'event' ? page * limit < eventsTotal : page * limit < announcementsTotal,
    };
}
