import { useCallback, useEffect, useState } from 'react';
import { AdminPrayerWallModel } from '../model/adminPrayerWall.model';
import type { AdminPrayer, AdminPrayerComment, IntercessionStatus } from '../model/adminPrayerWall.types';

const PRAYERS_PER_PAGE = 10;

export type AdminViewMode = 'ALL_CHURCH' | 'INTERCESSION';

export function useAdminPrayerWallViewModel() {
    // Mode & Filter State
    const [viewMode, setViewMode] = useState<AdminViewMode>('INTERCESSION');
    const [statusFilter, setStatusFilter] = useState<IntercessionStatus>('NOT_PRAYED_YET');

    // Prayer feed data
    const [prayers, setPrayers] = useState<AdminPrayer[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Screen state
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const [listPage, setListPage] = useState(1);
    const [transitionDirection, setTransitionDirection] = useState<1 | -1>(1);
    const [isFeaturedFlipped, setIsFeaturedFlipped] = useState(false);

    // Drawer state
    const [selectedDrawerPrayer, setSelectedDrawerPrayer] = useState<AdminPrayer | null>(null);
    const [drawerComments, setDrawerComments] = useState<AdminPrayerComment[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setFeaturedIndex(0);
        setListPage(1);
        setIsFeaturedFlipped(false);
        try {
            const page = viewMode === 'INTERCESSION'
                ? await AdminPrayerWallModel.fetchIntercessionQueue({ status: statusFilter })
                : await AdminPrayerWallModel.fetchChurchPrayers();

            setPrayers(page.items);
            setCursor(page.nextCursor);
            setHasMore(page.hasMore);
        } catch {
            setError('Could not load prayer requests. Make sure the backend is running.');
        } finally {
            setIsLoading(false);
        }
    }, [viewMode, statusFilter]);

    useEffect(() => {
        void load();
    }, [load]);

    // Fetches next page
    const loadMore = async () => {
        if (!hasMore || isLoadingMore) return;
        setIsLoadingMore(true);
        try {
            const page = viewMode === 'INTERCESSION'
                ? await AdminPrayerWallModel.fetchIntercessionQueue({ status: statusFilter, cursor })
                : await AdminPrayerWallModel.fetchChurchPrayers({ cursor });

            setPrayers(current => [...current, ...page.items]);
            setCursor(page.nextCursor);
            setHasMore(page.hasMore);
        } catch {
            // Keep current feed visible
        } finally {
            setIsLoadingMore(false);
        }
    };

    // Toggle 'PRAYED' reaction on prayer post
    const toggleMarkAsPrayed = async (prayerId: string) => {
        setIsActionLoading(prayerId);
        try {
            const res = await AdminPrayerWallModel.toggleMarkAsPrayed(prayerId);
            const isAdded = res.action === 'added';

            setPrayers(current => current.map(p => {
                if (p.id === prayerId) {
                    const currentCount = p.times_prayed_by_team ?? p.times_prayed_by_church ?? 0;
                    const newCount = isAdded ? currentCount + 1 : Math.max(0, currentCount - 1);
                    return {
                        ...p,
                        is_prayed_by_church: isAdded,
                        team_status: isAdded ? 'PRAYED' : (newCount > 0 ? 'PRAYED' : 'NOT_PRAYED_YET'),
                        times_prayed_by_team: newCount,
                        times_prayed_by_church: newCount
                    };
                }
                return p;
            }));

            if (selectedDrawerPrayer && selectedDrawerPrayer.id === prayerId) {
                setSelectedDrawerPrayer(curr => curr ? {
                    ...curr,
                    is_prayed_by_church: isAdded,
                    team_status: isAdded ? 'PRAYED' : 'NOT_PRAYED_YET'
                } : null);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Action failed';
            alert(msg);
        } finally {
            setIsActionLoading(null);
        }
    };

    // Drawer management
    const openDrawer = async (prayer: AdminPrayer) => {
        setSelectedDrawerPrayer(prayer);
        setIsLoadingComments(true);
        try {
            const details = await AdminPrayerWallModel.fetchPrayerById(prayer.id);
            setDrawerComments(details.comments ?? []);
        } catch {
            setDrawerComments([]);
        } finally {
            setIsLoadingComments(false);
        }
    };

    const closeDrawer = () => {
        setSelectedDrawerPrayer(null);
        setDrawerComments([]);
    };

    const addComment = async (content: string) => {
        if (!selectedDrawerPrayer) return;
        const newComment = await AdminPrayerWallModel.addComment(selectedDrawerPrayer.id, content);
        setDrawerComments(curr => [newComment, ...curr]);
    };

    const updateComment = async (commentId: string, content: string) => {
        if (!selectedDrawerPrayer) return;
        const updated = await AdminPrayerWallModel.updateComment(selectedDrawerPrayer.id, commentId, content);
        setDrawerComments(curr => curr.map(c => c.id === commentId ? { ...c, content: updated.content, updated_at: updated.updated_at } : c));
    };

    const deleteComment = async (commentId: string) => {
        if (!selectedDrawerPrayer) return;
        await AdminPrayerWallModel.deleteComment(selectedDrawerPrayer.id, commentId);
        setDrawerComments(curr => curr.filter(c => c.id !== commentId));
    };

    // Splits the prayer list into pages
    const totalListPages = Math.max(1, Math.ceil(prayers.length / PRAYERS_PER_PAGE));
    const paginatedPrayers = prayers.slice(
        (listPage - 1) * PRAYERS_PER_PAGE,
        listPage * PRAYERS_PER_PAGE,
    );

    return {
        viewMode,
        setViewMode: (mode: AdminViewMode) => setViewMode(mode),
        statusFilter,
        setStatusFilter: (status: IntercessionStatus) => setStatusFilter(status),
        prayers,
        paginatedPrayers,
        featured: prayers[featuredIndex] ?? null,
        featuredIndex,
        listPage,
        totalListPages,
        transitionDirection,
        isFeaturedFlipped,
        isLoading,
        isLoadingMore,
        isActionLoading,
        error,
        hasMore,
        retry: load,
        loadMore,
        toggleMarkAsPrayed,
        // Drawer Props
        selectedDrawerPrayer,
        drawerComments,
        isLoadingComments,
        openDrawer,
        closeDrawer,
        addComment,
        updateComment,
        deleteComment,
        // Navigation
        nextFeatured: () => {
            setIsFeaturedFlipped(false);
            setTransitionDirection(1);
            setFeaturedIndex(index => prayers.length ? (index + 1) % prayers.length : 0);
        },
        previousFeatured: () => {
            setIsFeaturedFlipped(false);
            setTransitionDirection(-1);
            setFeaturedIndex(index => prayers.length ? (index - 1 + prayers.length) % prayers.length : 0);
        },
        previousListPage: () => setListPage(page => Math.max(1, page - 1)),
        nextListPage: () => {
            setListPage(page => {
                const next = Math.min(totalListPages, page + 1);
                if (next === page && hasMore) void loadMore();
                return next;
            });
        },
        goToListPage: (page: number) => setListPage(Math.min(totalListPages, Math.max(1, page))),
        toggleFeaturedFlip: () => setIsFeaturedFlipped(flipped => !flipped),
    };
}
