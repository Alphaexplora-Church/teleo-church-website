import { ChevronLeft, ChevronRight, Heart, HeartHandshake } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import AdminHeader from '../../../../shared/components/AdminHeader';
import AdminSidebar from '../../../../shared/components/AdminSidebar';
import type { AdminPrayer } from '../model/adminPrayerWall.types';
import { useAdminPrayerWallViewModel } from '../viewmodel/useAdminPrayerWallViewModel';

export default function AdminPrayerWallView() {
    const vm = useAdminPrayerWallViewModel();
    const theme = CARD_THEMES[vm.featuredIndex % CARD_THEMES.length];

    return (
        <div className="admin-shell flex flex-col lg:flex-row">
            <AdminSidebar />
            <div className="relative z-10 flex flex-1 flex-col">
                <AdminHeader />
                <main className="admin-main mx-auto w-full max-w-7xl flex-1 space-y-8 px-6 py-8 lg:px-10">
                    <header>
                        <div>
                            <h1 className="font-serif text-2xl text-midnight-teal">Prayer Wall</h1>
                            <p className="mt-1 text-sm text-gray-500">A place for the church community to share, support, and pray together.</p>
                        </div>
                    </header>

                    {vm.isLoading ? (
                        <PrayerWallSkeleton />
                    ) : vm.error ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                            <p className="text-sm font-semibold text-red-500">{vm.error}</p>
                            <button onClick={vm.retry} className="mt-3 text-xs font-bold text-midnight-teal underline">Retry</button>
                        </div>
                    ) : (
                        <>
                            {/* Featured prayer card */}
                            <section className="prayer-featured-stage relative overflow-hidden rounded-3xl border border-white/70 bg-white/65 px-5 py-10 shadow-xl shadow-midnight-teal/5 backdrop-blur-xl sm:px-10">
                                <div className="mx-auto max-w-md">
                                    {vm.featured ? (
                                        <>
                                            <div className="prayer-card-deck relative mx-auto max-w-sm">
                                                {/* Colored cards behind the active card */}
                                                <motion.div className="absolute inset-x-7 bottom-3 top-7 rounded-3xl shadow-xl" animate={{ rotate: 6, backgroundColor: theme.backOne }} transition={{ duration: 0.45, ease: 'easeInOut' }} />
                                                <motion.div className="absolute inset-x-7 bottom-3 top-7 rounded-3xl shadow-xl" animate={{ rotate: -6, backgroundColor: theme.backTwo }} transition={{ duration: 0.45, ease: 'easeInOut', delay: 0.03 }} />
                                                <motion.div className="absolute inset-x-6 bottom-3 top-6 rounded-3xl shadow-xl" animate={{ rotate: 2, backgroundColor: theme.backThree }} transition={{ duration: 0.45, ease: 'easeInOut', delay: 0.06 }} />

                                                {/* Smooth card transition */}
                                                <AnimatePresence initial={false} custom={vm.transitionDirection}>
                                                    <motion.article
                                                        key={vm.featured.id}
                                                        custom={vm.transitionDirection}
                                                        variants={CARD_VARIANTS}
                                                        initial="enter"
                                                        animate="center"
                                                        exit="exit"
                                                        transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
                                                        className="absolute inset-3 z-10 cursor-pointer rounded-3xl outline-none focus-visible:ring-4 focus-visible:ring-harvest-orange/50"
                                                        style={{ perspective: 1200 }}
                                                        onClick={vm.toggleFeaturedFlip}
                                                        onKeyDown={event => {
                                                            if (event.key === 'Enter' || event.key === ' ') {
                                                                event.preventDefault();
                                                                vm.toggleFeaturedFlip();
                                                            }
                                                        }}
                                                        role="button"
                                                        tabIndex={0}
                                                        aria-label={vm.isFeaturedFlipped ? 'Show prayer title' : 'Show prayer description'}
                                                    >
                                                        {/* Click the card to flip between its title and description. */}
                                                        <motion.div
                                                            className="relative h-full w-full"
                                                            animate={{ rotateY: vm.isFeaturedFlipped ? 180 : 0 }}
                                                            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                                                            style={{ transformStyle: 'preserve-3d' }}
                                                        >
                                                            <div
                                                                className="absolute inset-0 flex flex-col rounded-3xl p-6 text-white shadow-2xl sm:p-7"
                                                                style={{ backgroundColor: theme.main, backfaceVisibility: 'hidden' }}
                                                            >
                                                                {/* Front of the prayer card */}
                                                                <PrayerCardHeader prayer={vm.featured} />
                                                                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-2 py-8 text-center">
                                                                    <p className="font-serif text-2xl leading-relaxed sm:text-3xl">{vm.featured.title}</p>
                                                                    {vm.featured.prayer_tag && <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">{vm.featured.prayer_tag}</span>}
                                                                </div>
                                                                <PrayerCardFooter prayer={vm.featured} />
                                                                <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Click to read details</p>
                                                            </div>

                                                            <div
                                                                className="absolute inset-0 flex flex-col rounded-3xl p-6 text-white shadow-2xl sm:p-7"
                                                                style={{ backgroundColor: theme.main, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                                            >
                                                                {/* Back of the prayer card */}
                                                                <PrayerCardHeader prayer={vm.featured} />
                                                                <div className="flex flex-1 items-center justify-center overflow-y-auto px-3 py-6 text-center">
                                                                    <p className="text-base leading-7 text-white/95 sm:text-lg">{vm.featured.description}</p>
                                                                </div>
                                                                <PrayerCardFooter prayer={vm.featured} />
                                                                <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Click to return</p>
                                                            </div>
                                                        </motion.div>
                                                    </motion.article>
                                                </AnimatePresence>
                                            </div>

                                            {/* Prayer card navigation */}
                                            <div className="mt-3 flex items-center justify-center gap-4">
                                                <button onClick={vm.previousFeatured} aria-label="Previous prayer" className="grid h-10 w-10 place-items-center rounded-full border border-midnight-teal/10 bg-[#f9fbfa] text-midnight-teal shadow-sm transition-all hover:-translate-y-0.5 hover:border-harvest-orange hover:bg-harvest-orange hover:text-white hover:shadow-lg"><ChevronLeft size={18} /></button>
                                                <span className="text-xs font-bold tracking-widest text-midnight-teal/45">{vm.featuredIndex + 1} / {vm.prayers.length}</span>
                                                <button onClick={vm.nextFeatured} aria-label="Next prayer" className="grid h-10 w-10 place-items-center rounded-full border border-midnight-teal/10 bg-[#f9fbfa] text-midnight-teal shadow-sm transition-all hover:-translate-y-0.5 hover:border-harvest-orange hover:bg-harvest-orange hover:text-white hover:shadow-lg"><ChevronRight size={18} /></button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="py-16 text-center text-gray-400">No prayer requests yet.</div>
                                    )}
                                </div>
                            </section>

                            {/* View-only prayer request list */}
                            <section className="overflow-hidden rounded-3xl border border-white/70 bg-white/75 shadow-xl shadow-midnight-teal/5 backdrop-blur-xl">
                                <div className="flex items-center justify-between border-b border-midnight-teal/10 px-6 py-5">
                                    <div>
                                        <h2 className="font-serif text-xl text-midnight-teal">All Prayer Requests</h2>
                                        <p className="mt-1 text-xs text-gray-400">{vm.prayers.length} request{vm.prayers.length === 1 ? '' : 's'} loaded{vm.hasMore ? ' — more available' : ''}</p>
                                    </div>
                                    <HeartHandshake className="text-harvest-orange" size={22} />
                                </div>
                                {/* Prayer list column labels */}
                                <div className="hidden grid-cols-[minmax(170px,0.75fr)_minmax(190px,1fr)_minmax(280px,1.6fr)] gap-6 border-b border-midnight-teal/10 bg-midnight-teal/[0.035] px-6 py-3 md:grid">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-midnight-teal/45">Author</span>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-midnight-teal/45">Title</span>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-midnight-teal/45">Description</span>
                                </div>
                                <div className="divide-y divide-midnight-teal/10">
                                    {vm.paginatedPrayers.length
                                        ? vm.paginatedPrayers.map(prayer => <PrayerListRow key={prayer.id} prayer={prayer} />)
                                        : <div className="p-8 text-center text-sm text-gray-400">No prayer requests yet.</div>}
                                </div>
                                {/* Prayer list pagination */}
                                <div className="flex flex-wrap items-center justify-center gap-2 border-t border-midnight-teal/10 bg-midnight-teal/[0.025] px-6 py-4">
                                    <button
                                        type="button"
                                        onClick={vm.previousListPage}
                                        disabled={vm.listPage === 1}
                                        className="grid h-9 w-9 place-items-center rounded-full border border-midnight-teal/10 bg-[#f9fbfa] text-midnight-teal shadow-sm transition-all hover:-translate-y-0.5 hover:border-harvest-orange hover:bg-harvest-orange hover:text-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 disabled:hover:border-midnight-teal/10 disabled:hover:bg-[#f9fbfa] disabled:hover:text-midnight-teal disabled:hover:shadow-sm"
                                        aria-label="Previous prayer list page"
                                    >
                                        <ChevronLeft size={17} />
                                    </button>
                                    {Array.from({ length: vm.totalListPages }, (_, index) => index + 1).map(page => (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => vm.goToListPage(page)}
                                            aria-label={`Go to prayer list page ${page}`}
                                            aria-current={vm.listPage === page ? 'page' : undefined}
                                            className={`grid h-9 min-w-9 place-items-center rounded-full px-3 text-xs font-bold transition-all hover:-translate-y-0.5 hover:bg-harvest-orange hover:text-white hover:shadow-md ${vm.listPage === page ? 'bg-midnight-teal text-white shadow-md' : 'border border-midnight-teal/10 bg-[#f9fbfa] text-midnight-teal'}`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={vm.nextListPage}
                                        disabled={vm.listPage === vm.totalListPages && !vm.hasMore}
                                        className="grid h-9 w-9 place-items-center rounded-full border border-midnight-teal/10 bg-[#f9fbfa] text-midnight-teal shadow-sm transition-all hover:-translate-y-0.5 hover:border-harvest-orange hover:bg-harvest-orange hover:text-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 disabled:hover:border-midnight-teal/10 disabled:hover:bg-[#f9fbfa] disabled:hover:text-midnight-teal disabled:hover:shadow-sm"
                                        aria-label="Next prayer list page"
                                    >
                                        {vm.isLoadingMore ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-midnight-teal/20 border-t-midnight-teal" /> : <ChevronRight size={17} />}
                                    </button>
                                    <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.14em] text-midnight-teal/40">
                                        Page {vm.listPage} of {vm.totalListPages}
                                    </span>
                                </div>
                            </section>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

function PrayerCardHeader({ prayer }: { prayer: AdminPrayer }) {
    const author = prayer.author_name || 'Anonymous';
    return (
        <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-white/85 font-serif text-sm font-bold text-midnight-teal">
                {initials(author)}
            </div>
            <div>
                <p className="font-bold">{author}</p>
                <p className="text-xs text-white/60">{formatTimeAgo(prayer)}</p>
            </div>
        </div>
    );
}

function PrayerCardFooter({ prayer }: { prayer: AdminPrayer }) {
    return (
        <div className="flex items-center justify-center gap-3">
            <CountBubble icon={<Heart size={18} fill="currentColor" />} value={prayer.reactions_count} />
            {prayer.is_answered && (
                <span className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-bold uppercase tracking-widest">
                    <HeartHandshake size={14} /> Answered
                </span>
            )}
        </div>
    );
}

function PrayerListRow({ prayer }: { prayer: AdminPrayer }) {
    const author = prayer.author_name || 'Anonymous';
    return (
        <article className="grid gap-4 px-6 py-5 md:grid-cols-[minmax(170px,0.75fr)_minmax(190px,1fr)_minmax(280px,1.6fr)] md:items-center md:gap-6">
            <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-midnight-teal font-serif text-sm font-bold text-soft-linen">
                    {initials(author)}
                </div>
                <div className="min-w-0">
                    <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.14em] text-midnight-teal/40 md:hidden">Author</span>
                    <p className="truncate font-bold text-midnight-teal">{author}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{formatTimeAgo(prayer)}</p>
                </div>
            </div>
            <div className="min-w-0">
                <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.14em] text-midnight-teal/40 md:hidden">Title</span>
                <p className="font-bold leading-6 text-midnight-teal/80">{prayer.title}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-soft-linen px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-midnight-teal/60">{prayer.audience.replace('_', ' ')}</span>
                    {prayer.prayer_tag && <span className="rounded-full bg-soft-linen px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-midnight-teal/60">{prayer.prayer_tag}</span>}
                    {prayer.is_answered && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">Answered</span>}
                </div>
            </div>
            <div className="min-w-0">
                <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.14em] text-midnight-teal/40 md:hidden">Description</span>
                <p className="text-sm leading-6 text-midnight-teal/60">{prayer.description}</p>
            </div>
        </article>
    );
}

function CountBubble({ icon, value }: { icon: React.ReactNode; value: number }) {
    return <div className="flex min-w-12 flex-col items-center gap-0.5 text-white/80">{icon}<span className="text-[10px] font-bold">{value}</span></div>;
}

function PrayerWallSkeleton() {
    return (
        <div className="space-y-8">
            <div className="h-96 animate-pulse rounded-3xl bg-white/70" />
            <div className="h-64 animate-pulse rounded-3xl bg-white/70" />
        </div>
    );
}

const CARD_THEMES = [
    { main: '#2f4f73', backOne: '#ec662c', backTwo: '#7b5ca8', backThree: '#168b82' },
    { main: '#07545c', backOne: '#d48b38', backTwo: '#486c91', backThree: '#9a5d7d' },
    { main: '#654d7f', backOne: '#ec662c', backTwo: '#08766f', backThree: '#385f86' },
    { main: '#8a4f68', backOne: '#2f7080', backTwo: '#d48b38', backThree: '#6d58a0' },
];

// Controls how cards enter and leave the deck.
const CARD_VARIANTS = {
    enter: (direction: number) => ({
        x: direction * 110,
        y: 18,
        rotate: direction * 7,
        scale: 0.94,
        opacity: 0,
    }),
    center: {
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction * -125,
        y: -12,
        rotate: direction * -8,
        scale: 0.95,
        opacity: 0,
    }),
};

function initials(name: string) {
    if (name.toLowerCase() === 'anonymous') return 'A';
    return name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
}

function formatTimeAgo(prayer: AdminPrayer) {
    if (prayer.created_at_metadata?.relative_time) return prayer.created_at_metadata.relative_time;
    const difference = Date.now() - new Date(prayer.created_at).getTime();
    const days = Math.max(0, Math.floor(difference / 86_400_000));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
}
