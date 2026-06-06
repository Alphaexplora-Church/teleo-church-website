    // ─── Admin Events: ViewModel ─────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ChurchEvent, Announcement } from '../../Experience/events/events.types';
import type { ContentTab, EventFormData } from './adminEvents.types';
import { AdminEventsService } from './adminEvents.service';

type ContentItem = ChurchEvent | Announcement;

export interface AdminEventsViewModel {
    // Tab
    activeTab: ContentTab;
    setActiveTab: (tab: ContentTab) => void;

    // Data
    events: ChurchEvent[];
    announcements: Announcement[];
    filteredEvents: ChurchEvent[];
    filteredAnnouncements: Announcement[];
    isLoading: boolean;
    error: string | null;

    // Search
    search: string;
    setSearch: (v: string) => void;

    // Stats (derived — per active tab)
    stats: { total: number; withImages: number; categories: number };

    // Modal state
    showModal: boolean;
    editTarget: ContentItem | null;
    deleteTarget: ContentItem | null;

    // Toast
    toast: { msg: string; type: 'success' | 'error' } | null;

    // Handlers
    openCreateModal: () => void;
    openEditModal: (item: ContentItem) => void;
    closeModal: () => void;
    openDeleteModal: (item: ContentItem) => void;
    closeDeleteModal: () => void;
    handleSave: (data: EventFormData) => Promise<void>;
    handleDelete: () => Promise<void>;
    retry: () => void;

    // Pagination
    page: number;
    nextPage: () => void;
    prevPage: () => void;
    hasMore: boolean;
}

export function useAdminEventsViewModel(): AdminEventsViewModel {
    const navigate = useNavigate();

    // ── State ──────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<ContentTab>('event');
    const [events, setEvents] = useState<ChurchEvent[]>([]);
    const [eventsTotal, setEventsTotal] = useState(0);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [announcementsTotal, setAnnouncementsTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const [page, setPage] = useState(1);
    const limit = 10;

    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState<ContentItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);

    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    // ── Auth guard ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!localStorage.getItem('token')) navigate('/login');
    }, [navigate]);

    // ── Initial load — fetch both in parallel ──────────────────────────────
    useEffect(() => { loadAll(page); }, [page]);

    // ── Reset search when switching tabs ───────────────────────────────────
    useEffect(() => { setSearch(''); setPage(1); }, [activeTab]);

    // ── Internal helpers ───────────────────────────────────────────────────
    const loadAll = async (currentPage: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const [eventsResult, announcementsResult] = await Promise.all([
                AdminEventsService.fetchEvents(currentPage, limit),
                AdminEventsService.fetchAnnouncements(currentPage, limit),
            ]);
            setEvents(eventsResult.items);
            setEventsTotal(eventsResult.total);
            setAnnouncements(announcementsResult.items);
            setAnnouncementsTotal(announcementsResult.total);
        } catch {
            setError('Could not load content. Make sure the backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Derived: filtered lists ────────────────────────────────────────────
    const q = search.toLowerCase();

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(q) ||
        (e.location ?? '').toLowerCase().includes(q) ||
        (e.category_content ?? '').toLowerCase().includes(q)
    );

    const filteredAnnouncements = announcements.filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.category_content ?? '').toLowerCase().includes(q) ||
        (a.description ?? '').toLowerCase().includes(q)
    );

    // ── Derived: stats (per active tab) ────────────────────────────────────
    const stats = activeTab === 'event'
        ? {
            total: eventsTotal,
            withImages: events.filter(e => e.media && e.media.length > 0).length,
            categories: new Set(events.map(e => e.category_content).filter(Boolean)).size,
        }
        : {
            total: announcementsTotal,
            withImages: announcements.filter(a => a.media && a.media.length > 0).length,
            categories: new Set(announcements.map(a => a.category_content).filter(Boolean)).size,
        };

    // ── Handlers ───────────────────────────────────────────────────────────
    const openCreateModal = () => { setEditTarget(null); setShowModal(true); };
    const openEditModal = (item: ContentItem) => { setEditTarget(item); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditTarget(null); };
    const openDeleteModal = (item: ContentItem) => setDeleteTarget(item);
    const closeDeleteModal = () => setDeleteTarget(null);

    const handleSave = async (data: EventFormData) => {
        try {
            if (editTarget) {
                await AdminEventsService.updateEvent(editTarget.id, data, activeTab);
                showToast(`"${data.title}" updated successfully.`);
            } else {
                await AdminEventsService.createEvent(data, activeTab);
                showToast(`"${data.title}" created.`);
            }
            closeModal();
            await loadAll(page);
        } catch (err: any) {
            console.error('Save failed:', err);
            showToast(`Failed to save: ${err.message || 'Unknown error'}`, 'error');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await AdminEventsService.deleteEvent(deleteTarget.id);
            if (activeTab === 'announcement') {
                setAnnouncements(prev => prev.filter(a => a.id !== deleteTarget.id));
            } else {
                setEvents(prev => prev.filter(e => e.id !== deleteTarget.id));
            }
            showToast(`"${deleteTarget.title}" deleted.`);
            closeDeleteModal();
        } catch {
            showToast('Failed to delete.', 'error');
        }
    };

    return {
        activeTab,
        setActiveTab,
        events,
        announcements,
        filteredEvents,
        filteredAnnouncements,
        isLoading,
        error,
        search,
        setSearch,
        stats,
        showModal,
        editTarget,
        deleteTarget,
        toast,
        openCreateModal,
        openEditModal,
        closeModal,
        openDeleteModal,
        closeDeleteModal,
        handleSave,
        handleDelete,
        retry: () => loadAll(page),
        page,
        nextPage: () => setPage(p => p + 1),
        prevPage: () => setPage(p => Math.max(1, p - 1)),
        hasMore: activeTab === 'event'
            ? page * limit < eventsTotal
            : page * limit < announcementsTotal,
    };}
