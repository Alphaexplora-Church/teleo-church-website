import { Archive, CalendarDays, Eye, Image as ImageIcon, Megaphone, Pencil, Plus, Search } from 'lucide-react';
import AdminHeader from '../../../../shared/components/AdminHeader';
import AdminSidebar from '../../../../shared/components/AdminSidebar';
import type { ContentItem } from '../model/content.types';
import { useAdminEventsViewModel } from '../viewmodel/useAdminEventsViewModel';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { ContentPreviewModal } from './ContentPreviewModal';
import { EventModal } from './EventModal';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=400&auto=format&fit=crop';

const inputDate = (value?: { date: string } | null) => {
    if (!value?.date) return '';
    const date = new Date(value.date);
    if (Number.isNaN(date.getTime())) return '';
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 10);
};

const inputTime = (value?: { time: string } | null) => {
    if (!value?.time) return '';
    const match = value.time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return value.time.slice(0, 5);
    let hour = Number(match[1]);
    const period = match[3]?.toUpperCase();
    if (period === 'PM' && hour < 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return `${String(hour).padStart(2, '0')}:${match[2]}`;
};

const formatTimestamp = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(date);
};

export default function AdminEventsView() {
    const vm = useAdminEventsViewModel();
    const isEvent = vm.activeTab === 'event';
    const label = isEvent ? 'Event' : 'Announcement';
    const modalTitle = vm.editTarget ? `Edit ${label}` : `New ${label}`;
    const modalInitial = vm.editTarget ? {
        title: vm.editTarget.title,
        description: vm.editTarget.description ?? '',
        location: 'location' in vm.editTarget ? vm.editTarget.location ?? '' : '',
        category_content: vm.editTarget.category_content ?? '',
        start_date_date: inputDate(vm.editTarget.start_date),
        start_date_time: inputTime(vm.editTarget.start_date),
        end_date_date: 'end_date' in vm.editTarget ? inputDate(vm.editTarget.end_date) : '',
        end_date_time: 'end_date' in vm.editTarget ? inputTime(vm.editTarget.end_date) : '',
    } : undefined;
    const visibleItems: ContentItem[] = isEvent ? vm.filteredEvents : vm.filteredAnnouncements;

    return (
        <div className="admin-shell flex flex-col lg:flex-row">
            <AdminSidebar />
            <div className="relative z-10 flex flex-1 flex-col">
                <AdminHeader userName="Admin" />
                <main className="admin-main mx-auto w-full max-w-7xl flex-1 space-y-6 px-6 py-8 lg:px-10">
                    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="font-serif text-2xl text-midnight-teal">{isEvent ? 'Events' : 'Announcements'}</h1>
                            <p className="mt-0.5 text-sm text-gray-400">{isEvent ? 'Manage all church events and programs.' : 'Manage church-wide announcements and news.'}</p>
                        </div>
                        <button onClick={vm.openCreateModal} className="flex items-center justify-center gap-2 rounded-xl bg-midnight-teal px-5 py-2.5 text-sm font-bold text-soft-linen shadow transition-colors hover:bg-midnight-teal/90">
                            <Plus size={16} /> New {label}
                        </button>
                    </header>

                    <div className="flex w-fit gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                        <TabButton active={isEvent} count={vm.events.length} icon={<CalendarDays size={16} />} onClick={() => vm.setActiveTab('event')}>Events</TabButton>
                        <TabButton active={!isEvent} count={vm.announcements.length} icon={<Megaphone size={16} />} onClick={() => vm.setActiveTab('announcement')}>Announcements</TabButton>
                    </div>

                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Content overview">
                        {vm.stats.map(stat => (
                            <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
                                <p className={`font-serif text-3xl ${stat.accent ? 'text-harvest-orange' : 'text-midnight-teal'}`}>{stat.value}</p>
                            </div>
                        ))}
                    </section>

                    <section className="grid gap-3 rounded-2xl border border-white/70 bg-white/75 p-3 shadow-sm backdrop-blur-md lg:grid-cols-[minmax(260px,1fr)_auto_auto_auto]" aria-label="Content filters">
                        <div className="relative">
                            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-midnight-teal/45" />
                            <input value={vm.search} onChange={event => vm.setSearch(event.target.value)} placeholder={isEvent ? 'Search by title, location or category…' : 'Search by title, category or description…'} className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-midnight-teal/30" />
                        </div>
                        <FilterSelect label="Status" value={vm.statusFilter} onChange={value => vm.setStatusFilter(value as typeof vm.statusFilter)}>
                            <option value="all">All statuses</option>
                            <option value="active">Active</option>
                            {isEvent ? <option value="completed">Completed</option> : <option value="archived">Archived</option>}
                        </FilterSelect>
                        <FilterSelect label="Category" value={vm.categoryFilter} onChange={vm.setCategoryFilter}>
                            <option value="all">All categories</option>
                            {vm.categories.map(category => <option key={category} value={category}>{category}</option>)}
                        </FilterSelect>
                        <FilterSelect label="Sort" value={vm.sort} onChange={value => vm.setSort(value as typeof vm.sort)}>
                            {isEvent && <option value="date-asc">Event date: soonest</option>}
                            {isEvent && <option value="date-desc">Event date: latest</option>}
                            <option value="newest">Recently created</option>
                            <option value="title">Title A–Z</option>
                        </FilterSelect>
                    </section>

                    {vm.isLoading ? (
                        <div className="flex flex-col gap-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl border border-gray-100 bg-white" />)}</div>
                    ) : vm.error ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"><p className="text-sm font-semibold text-red-500">{vm.error}</p><button onClick={vm.retry} className="mt-3 text-xs font-bold text-midnight-teal underline">Retry</button></div>
                    ) : visibleItems.length === 0 ? (
                        <EmptyState label={label.toLowerCase()} />
                    ) : (
                        <div className="flex flex-col gap-3">
                            {visibleItems.map(item => <ContentCard key={item.id} item={item} isEvent={isEvent} onPreview={() => vm.openPreviewModal(item)} onEdit={() => vm.openEditModal(item)} onArchive={() => vm.openDeleteModal(item)} />)}
                        </div>
                    )}

                    {!vm.isLoading && !vm.error && (visibleItems.length > 0 || vm.page > 1) && (
                        <div className="mt-6 flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                            <PageButton disabled={vm.page === 1} onClick={vm.prevPage}>Previous</PageButton>
                            <span className="text-sm font-bold text-gray-500">Page {vm.page}</span>
                            <PageButton disabled={!vm.hasMore} onClick={vm.nextPage}>Next</PageButton>
                        </div>
                    )}
                </main>
            </div>

            {vm.toast && <div className={`fixed bottom-6 right-6 z-50 rounded-xl px-5 py-3 text-sm font-semibold shadow-xl ${vm.toast.type === 'success' ? 'bg-midnight-teal text-soft-linen' : 'bg-red-500 text-white'}`}>{vm.toast.msg}</div>}
            {vm.showModal && <EventModal key={vm.editTarget?.id ?? 'new'} title={modalTitle} initial={modalInitial} onClose={vm.closeModal} onSave={vm.handleSave} />}
            <ContentPreviewModal item={vm.previewTarget} type={vm.activeTab} onClose={vm.closePreviewModal} />
            <ConfirmDeleteModal open={Boolean(vm.deleteTarget)} contentTitle={vm.deleteTarget?.title ?? ''} onCancel={vm.closeDeleteModal} onConfirm={vm.handleDelete} />
        </div>
    );
}

function TabButton({ active, count, icon, children, onClick }: { active: boolean; count: number; icon: React.ReactNode; children: React.ReactNode; onClick: () => void }) {
    return <button onClick={onClick} className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold transition-all ${active ? 'bg-midnight-teal text-soft-linen shadow' : 'text-gray-400 hover:text-midnight-teal'}`}>{icon}{children}<span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>{count}</span></button>;
}

function FilterSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
    return <label className="sr-only-label"><span className="sr-only">{label}</span><select aria-label={label} value={value} onChange={event => onChange(event.target.value)} className="h-full min-h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-midnight-teal outline-none focus:ring-2 focus:ring-midnight-teal/30">{children}</select></label>;
}

function ContentCard({ item, isEvent, onPreview, onEdit, onArchive }: { item: ContentItem; isEvent: boolean; onPreview: () => void; onEdit: () => void; onArchive: () => void }) {
    const archived = item.status === 'archived';
    const location = 'location' in item ? item.location : null;
    const endDate = 'end_date' in item ? item.end_date : null;
    const schedule = item.start_date ? (isEvent && endDate ? `${item.start_date.date} · ${item.start_date.time} – ${endDate.date === item.start_date.date ? endDate.time : `${endDate.date} · ${endDate.time}`}` : `${item.start_date.date} · ${item.start_date.time}`) : null;
    const created = formatTimestamp(item.created_at);

    return (
        <article className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100"><img src={item.media?.[0]?.file_url ?? FALLBACK_IMAGE} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" onError={event => { event.currentTarget.src = FALLBACK_IMAGE; }} /></div>
            <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2"><h3 className="truncate font-serif text-base font-semibold text-midnight-teal">{item.title}</h3><StatusBadge status={item.status} />{item.category_content && <span className="rounded-full border border-harvest-orange/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-harvest-orange">{item.category_content}</span>}</div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">{schedule && <span>{schedule}</span>}{location && <span>{location}</span>}{item.author?.username && <span>By {item.author.username}</span>}{created && <span>Created {created}</span>}{Boolean(item.media?.length) && <span className="flex items-center gap-1 text-emerald-600"><ImageIcon size={12} />{item.media?.length}</span>}</div>
                {item.description && <p className="mt-1 line-clamp-1 text-xs text-gray-400">{item.description}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-1">
                <IconButton title="Preview" onClick={onPreview}><Eye size={16} /></IconButton>
                {!archived && <IconButton title="Edit" onClick={onEdit}><Pencil size={16} /></IconButton>}
                {!archived && <IconButton title="Archive" onClick={onArchive} danger><Archive size={16} /></IconButton>}
            </div>
        </article>
    );
}

function StatusBadge({ status }: { status?: string | null }) {
    const value = status || 'active';
    const style = value === 'active' ? 'bg-emerald-50 text-emerald-700' : value === 'completed' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600';
    return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${style}`}>{value}</span>;
}

function IconButton({ title, onClick, danger = false, children }: { title: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
    return <button onClick={onClick} title={title} aria-label={title} className={`grid h-9 w-9 place-items-center rounded-lg transition-colors ${danger ? 'text-red-400 hover:bg-red-50 hover:text-red-500' : 'text-midnight-teal/60 hover:bg-midnight-teal/10 hover:text-midnight-teal'}`}>{children}</button>;
}

function EmptyState({ label }: { label: string }) {
    return <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm"><div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-soft-linen"><CalendarDays className="text-midnight-teal/40" size={28} /></div><p className="font-serif text-lg text-midnight-teal">No {label}s found</p><p className="mt-1 text-sm text-gray-400">Try changing the filters, or add a new {label}.</p></div>;
}

function PageButton({ disabled, onClick, children }: { disabled: boolean; onClick: () => void; children: React.ReactNode }) {
    return <button disabled={disabled} onClick={onClick} className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${disabled ? 'cursor-not-allowed bg-gray-50 text-gray-300' : 'bg-soft-linen text-midnight-teal hover:bg-midnight-teal hover:text-soft-linen'}`}>{children}</button>;
}
