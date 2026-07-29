import { useState } from 'react';
import { AdminPrayerWallModel } from '../model/adminPrayerWall.model';
import type { NewPrayerForm, PrayerRequest } from '../model/adminPrayerWall.types';

const PRAYERS_PER_PAGE = 10;

export function useAdminPrayerWallViewModel() {
    // Prayer Wall screen state.
    const [prayers, setPrayers] = useState<PrayerRequest[]>(() => AdminPrayerWallModel.getPrayers());
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const [listPage, setListPage] = useState(1);
    const [transitionDirection, setTransitionDirection] = useState<1 | -1>(1);
    const [isFeaturedFlipped, setIsFeaturedFlipped] = useState(false);
    const [prayedIds, setPrayedIds] = useState<Set<string>>(() => new Set());
    const [showForm, setShowForm] = useState(false);

    // Splits the prayer list into pages.
    const totalListPages = Math.max(1, Math.ceil(prayers.length / PRAYERS_PER_PAGE));
    const paginatedPrayers = prayers.slice(
        (listPage - 1) * PRAYERS_PER_PAGE,
        listPage * PRAYERS_PER_PAGE,
    );

    // Updates the screen and local preview data.
    const persist = (next: PrayerRequest[]) => {
        setPrayers(next);
        AdminPrayerWallModel.savePrayers(next);
    };

    const togglePrayer = (id: string) => {
        const alreadyPrayed = prayedIds.has(id);
        const nextIds = new Set(prayedIds);
        if (alreadyPrayed) nextIds.delete(id);
        else nextIds.add(id);
        setPrayedIds(nextIds);
        persist(prayers.map(prayer => prayer.id === id
            ? { ...prayer, prayerCount: Math.max(0, prayer.prayerCount + (alreadyPrayed ? -1 : 1)) }
            : prayer));
    };

    // Adds a new request to the top of the list.
    const addPrayer = (form: NewPrayerForm) => {
        const prayer = AdminPrayerWallModel.createPrayer(form);
        persist([prayer, ...prayers]);
        setFeaturedIndex(0);
        setListPage(1);
        setIsFeaturedFlipped(false);
        setTransitionDirection(1);
        setShowForm(false);
    };

    return {
        prayers,
        paginatedPrayers,
        featured: prayers[featuredIndex] ?? null,
        featuredIndex,
        listPage,
        totalListPages,
        transitionDirection,
        isFeaturedFlipped,
        prayedIds,
        showForm,
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
        nextListPage: () => setListPage(page => Math.min(totalListPages, page + 1)),
        goToListPage: (page: number) => setListPage(Math.min(totalListPages, Math.max(1, page))),
        // Flips the active card.
        toggleFeaturedFlip: () => setIsFeaturedFlipped(flipped => !flipped),
        togglePrayer,
        openForm: () => setShowForm(true),
        closeForm: () => setShowForm(false),
        addPrayer,
    };
}
