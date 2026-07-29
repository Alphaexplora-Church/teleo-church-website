import { useEffect, useState } from 'react';
import { AdminPrayerWallModel } from '../model/adminPrayerWall.model';
import type { AdminPrayer } from '../model/adminPrayerWall.types';

const PRAYERS_PER_PAGE = 10;

export function useAdminPrayerWallViewModel() {
    // Prayer feed data (from GET /api/prayers/admin/churches).
    const [prayers, setPrayers] = useState<AdminPrayer[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Screen state.
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const [listPage, setListPage] = useState(1);
    const [transitionDirection, setTransitionDirection] = useState<1 | -1>(1);
    const [isFeaturedFlipped, setIsFeaturedFlipped] = useState(false);

    const load = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const page = await AdminPrayerWallModel.fetchChurchPrayers();
            setPrayers(page.items);
            setCursor(page.nextCursor);
            setHasMore(page.hasMore);
        } catch {
            setError('Could not load prayer requests. Make sure the backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    // Fetches the next cursor page and appends it to the feed.
    const loadMore = async () => {
        if (!hasMore || isLoadingMore) return;
        setIsLoadingMore(true);
        try {
            const page = await AdminPrayerWallModel.fetchChurchPrayers({ cursor });
            setPrayers(current => [...current, ...page.items]);
            setCursor(page.nextCursor);
            setHasMore(page.hasMore);
        } catch {
            // Keep the already-loaded feed visible; the user can retry via the button.
        } finally {
            setIsLoadingMore(false);
        }
    };

    // Splits the prayer list into pages.
    const totalListPages = Math.max(1, Math.ceil(prayers.length / PRAYERS_PER_PAGE));
    const paginatedPrayers = prayers.slice(
        (listPage - 1) * PRAYERS_PER_PAGE,
        listPage * PRAYERS_PER_PAGE,
    );

    return {
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
        error,
        hasMore,
        retry: load,
        loadMore,
        // Moves to the next card.
        nextFeatured: () => {
            setIsFeaturedFlipped(false);
            setTransitionDirection(1);
            setFeaturedIndex(index => prayers.length ? (index + 1) % prayers.length : 0);
        },
        // Moves to the previous card.
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
        // Flips the active card.
        toggleFeaturedFlip: () => setIsFeaturedFlipped(flipped => !flipped),
    };
}
