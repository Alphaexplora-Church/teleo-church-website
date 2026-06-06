// ─── Admin Events: View ──────────────────────────────────────────────────────
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { useAdminEventsViewModel } from './events/useAdminEventsViewModel';
import { EventModal } from './events/EventModal';
import { ConfirmDeleteModal } from './events/ConfirmDeleteModal';

const FALLBACK_IMAGE =
    'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=400&auto=format&fit=crop';

export default function AdminEvents() {
    const vm = useAdminEventsViewModel();

    const isEvent = vm.activeTab === 'event';
    const label = isEvent ? 'Event' : 'Announcement';

    const parseStartValue = (item: any, part: 'date' | 'time') => {
        const value = item?.start_date;
        if (!value) return '';
        if (typeof value === 'string') {
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return '';
            return part === 'date' ? date.toISOString().slice(0, 10) : date.toISOString().slice(11, 16);
        }
        return part === 'date' ? value.date : value.time;
    };

    const modalTitle = vm.activeTab === 'announcement'
        ? (vm.editTarget ? 'Edit Announcement' : 'New Announcement')
        : (vm.editTarget ? 'Edit Event' : 'New Event');

    const modalInitial = vm.editTarget ? {
        title: vm.editTarget.title,
        description: vm.editTarget.description ?? '',
        location: 'location' in vm.editTarget ? vm.editTarget.location ?? '' : '',
        category_content: vm.editTarget.category_content ?? '',
        start_date_date: parseStartValue(vm.editTarget, 'date'),
        start_date_time: parseStartValue(vm.editTarget, 'time'),
        end_date_date: 'end_date' in vm.editTarget && vm.editTarget.end_date ? vm.editTarget.end_date.date : '',
        end_date_time: 'end_date' in vm.editTarget && vm.editTarget.end_date ? vm.editTarget.end_date.time : '',
    } : undefined;

    return (
        <div className="flex min-h-screen bg-soft-linen">
            <AdminSidebar />

            <div className="flex-1 flex flex-col">
                <AdminHeader userName="Admin" />

                <main className="p-6 flex-1 space-y-6">

                    {/* ── Page Title ─────────────────────────────────── */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-serif text-midnight-teal">
                                {isEvent ? 'Events' : 'Announcements'}
                            </h1>
                            <p className="text-sm text-gray-400 mt-0.5">
                                {isEvent
                                    ? 'Manage all church events and programs.'
                                    : 'Manage church-wide announcements and news.'}
                            </p>
                        </div>
                        <button
                            onClick={vm.openCreateModal}
                            className="flex items-center gap-2 bg-midnight-teal text-soft-linen px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-midnight-teal/90 transition-colors shadow"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New {label}
                        </button>
                    </div>

                    {/* ── Tab Toggle ─────────────────────────────────── */}
                    <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm">
                        <button
                            onClick={() => vm.setActiveTab('event')}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200
                                ${isEvent
                                    ? 'bg-midnight-teal text-soft-linen shadow'
                                    : 'text-gray-400 hover:text-midnight-teal'}`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Events
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isEvent ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                                {vm.events.length}
                            </span>
                        </button>
                        <button
                            onClick={() => vm.setActiveTab('announcement')}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200
                                ${!isEvent
                                    ? 'bg-midnight-teal text-soft-linen shadow'
                                    : 'text-gray-400 hover:text-midnight-teal'}`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                            Announcements
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${!isEvent ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                                {vm.announcements.length}
                            </span>
                        </button>
                    </div>

                    {/* ── Stats ──────────────────────────────────────── */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                                Total {label}s
                            </p>
                            <p className="text-3xl font-serif text-midnight-teal">{vm.stats.total}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">With Images</p>
                            <p className="text-3xl font-serif text-harvest-orange">{vm.stats.withImages}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 col-span-2 md:col-span-1">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Categories</p>
                            <p className="text-3xl font-serif text-midnight-teal">{vm.stats.categories}</p>
                        </div>
                    </div>

                    {/* ── Search ─────────────────────────────────────── */}
                    <div className="relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z" />
                        </svg>
                        <input
                            value={vm.search}
                            onChange={e => vm.setSearch(e.target.value)}
                            placeholder={isEvent
                                ? 'Search by title, location or category…'
                                : 'Search by title, category or description…'}
                            className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-midnight-teal/30 shadow-sm"
                        />
                    </div>

                    {/* ── Content List ───────────────────────────────── */}
                    {vm.isLoading ? (
                        <div className="flex flex-col gap-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-gray-100" />
                            ))}
                        </div>

                    ) : vm.error ? (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                            <p className="text-red-500 text-sm font-semibold">{vm.error}</p>
                            <button onClick={vm.retry} className="mt-3 text-xs font-bold text-midnight-teal underline">
                                Retry
                            </button>
                        </div>

                    ) : isEvent ? (
                        /* ── Events ── */
                        vm.filteredEvents.length === 0 ? (
                            <EmptyState label="event" />
                        ) : (
                            <div className="flex flex-col gap-3">
                                {vm.filteredEvents.map(event => {
                                    const thumb = event.media?.length > 0 ? event.media[0].file_url : FALLBACK_IMAGE;
                                    return (
                                        <ContentCard
                                            key={event.id}
                                            thumb={thumb}
                                            title={event.title}
                                            category={event.category_content}
                                            meta={[
                                                event.start_date && event.end_date
                                                    ? (event.start_date.date === event.end_date.date
                                                        ? `${event.start_date.date} · ${event.start_date.time} - ${event.end_date.time}`
                                                        : `${event.start_date.date} · ${event.start_date.time} - ${event.end_date.date} · ${event.end_date.time}`)
                                                    : event.start_date ? `${event.start_date.date} · ${event.start_date.time}` : null,
                                                event.location ?? null,
                                            ].filter(Boolean) as string[]}
                                            imageCount={event.media?.length ?? 0}
                                            description={event.description}
                                            onEdit={() => vm.openEditModal(event)}
                                            onDelete={() => vm.openDeleteModal(event)}
                                        />
                                    );
                                })}
                            </div>
                        )

                    ) : (
                        /* ── Announcements ── */
                        vm.filteredAnnouncements.length === 0 ? (
                            <EmptyState label="announcement" />
                        ) : (
                            <div className="flex flex-col gap-3">
                                {vm.filteredAnnouncements.map(note => {
                                    const thumb = note.media?.length > 0 ? note.media[0].file_url : FALLBACK_IMAGE;
                                    const dateStr = note.start_date
                                        ? `${note.start_date.date} · ${note.start_date.time}`
                                        : null;
                                    return (
                                        <ContentCard
                                            key={note.id}
                                            thumb={thumb}
                                            title={note.title}
                                            category={note.category_content}
                                            meta={[dateStr, note.status ? `Status: ${note.status}` : null].filter(Boolean) as string[]}
                                            imageCount={note.media?.length ?? 0}
                                            description={note.description}
                                            onEdit={() => vm.openEditModal(note)}
                                            onDelete={() => vm.openDeleteModal(note)}
                                        />
                                    );
                                })}
                            </div>
                        )
                    )}

                    {/* ── Pagination ─────────────────────────────────── */}
                    {!vm.isLoading && !vm.error && (
                        (isEvent && (vm.filteredEvents.length > 0 || vm.page > 1)) ||
                        (!isEvent && (vm.filteredAnnouncements.length > 0 || vm.page > 1))
                    ) && (
                        <div className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-sm mt-6">
                            <button
                                onClick={vm.prevPage}
                                disabled={vm.page === 1}
                                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                                    vm.page === 1 
                                        ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
                                        : 'text-midnight-teal bg-soft-linen hover:bg-midnight-teal hover:text-soft-linen'
                                }`}
                            >
                                Previous
                            </button>
                            <span className="text-sm font-bold text-gray-500">
                                Page {vm.page}
                            </span>
                            <button
                                onClick={vm.nextPage}
                                disabled={!vm.hasMore}
                                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                                    !vm.hasMore 
                                        ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
                                        : 'text-midnight-teal bg-soft-linen hover:bg-midnight-teal hover:text-soft-linen'
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {/* ── Toast ──────────────────────────────────────── */}
            {vm.toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all
                    ${vm.toast.type === 'success' ? 'bg-midnight-teal text-soft-linen' : 'bg-red-500 text-white'}`}>
                    {vm.toast.msg}
                </div>
            )}

            <EventModal
                open={vm.showModal}
                title={modalTitle}
                initial={modalInitial}
                onClose={vm.closeModal}
                onSave={vm.handleSave}
            />

            <ConfirmDeleteModal
                open={!!vm.deleteTarget}
                eventTitle={vm.deleteTarget?.title ?? ''}
                onCancel={vm.closeDeleteModal}
                onConfirm={vm.handleDelete}
            />
        </div>
    );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
    return (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-soft-linen flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-midnight-teal/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
            <p className="font-serif text-lg text-midnight-teal">No {label}s found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different search, or add a new {label}.</p>
        </div>
    );
}

interface ContentCardProps {
    thumb: string;
    title: string;
    category?: string;
    meta: string[];
    imageCount: number;
    description?: string;
    onEdit: () => void;
    onDelete: () => void;
}

function ContentCard({ thumb, title, category, meta, imageCount, description, onEdit, onDelete }: ContentCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 p-4 hover:shadow-md transition-shadow group">
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                <img
                    src={thumb}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=400&auto=format&fit=crop'; }}
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h3 className="font-serif text-midnight-teal text-base font-semibold truncate">{title}</h3>
                    {category && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-harvest-orange border border-harvest-orange/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                            {category}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3 flex-wrap text-xs text-gray-400 font-sans">
                    {meta.map((m, i) => (
                        <span key={i}>{m}</span>
                    ))}
                    {imageCount > 0 && (
                        <span className="flex items-center gap-1 text-green-500">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {imageCount} image{imageCount > 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{description}</p>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={onEdit}
                    title="Edit"
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-midnight-teal/60 hover:bg-midnight-teal/10 hover:text-midnight-teal transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <button
                    onClick={onDelete}
                    title="Delete"
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-red-400/70 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
