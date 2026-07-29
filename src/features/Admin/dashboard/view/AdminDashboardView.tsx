import { ArrowRight, CalendarCheck, CalendarClock, MapPin, Megaphone
        // Plus, UserCog, UserPlus, UsersRound 
    } from 'lucide-react';
import AdminHeader from '../../../../shared/components/AdminHeader';
import AdminSidebar from '../../../../shared/components/AdminSidebar';
import type { Announcement, ChurchEvent } from '../../events/model/content.types';
// import type { DashboardRegistration } from '../model/adminDashboard.types';
import { useAdminDashboardViewModel } from '../viewmodel/useAdminDashboardViewModel';

export default function AdminDashboardView() {
    const vm = useAdminDashboardViewModel();
    // const visitorTotal = vm.data?.visitors.total ?? 0;
    // const firstTimePercent = visitorTotal ? Math.round(((vm.data?.visitors.firstTime ?? 0) / visitorTotal) * 100) : 0;

    return (
        <div className="admin-shell flex flex-col lg:flex-row">
            <AdminSidebar />
            <div className="relative z-10 flex flex-1 flex-col">
                <AdminHeader />
                <main className="admin-main mx-auto w-full max-w-7xl flex-1 space-y-6 px-6 pb-5 pt-8 lg:px-10">
                    <header>
                        <h1 className="font-serif text-2xl text-midnight-teal">Home Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-500">A quick overview of church content and registrations.</p>
                    </header>

                    {vm.isLoading ? <DashboardSkeleton /> : vm.error ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center"><p className="text-sm font-semibold text-red-500">{vm.error}</p><button onClick={vm.retry} className="mt-3 text-xs font-bold text-midnight-teal underline">Retry</button></div>
                    ) : vm.data && (
                        <>
                            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Dashboard metrics">
                                <KpiCard icon={<CalendarClock size={19} />} label="Upcoming this month" value={vm.data.kpis.upcomingMonth} />
                                <KpiCard icon={<CalendarCheck size={19} />} label="Events this week" value={vm.data.kpis.thisWeek} accent />
                                <KpiCard icon={<Megaphone size={19} />} label="Active announcements" value={vm.data.kpis.activeAnnouncements} />
                                {/* <KpiCard icon={<UserPlus size={19} />} label="New registrations" value={vm.data.kpis.newRegistrations} accent /> */}
                            </section>

                            <div className="grid gap-6 xl:grid-cols-[1.55fr_.75fr]">
                                <DashboardPanel>
                                    <PanelHeader title="Upcoming events" action="View all" onAction={vm.goToContent} />
                                    <div className="divide-y divide-midnight-teal/10">
                                        {vm.data.upcomingEvents.length ? vm.data.upcomingEvents.map(event => <UpcomingEvent key={event.id} event={event} />) : <EmptyPanel message="No upcoming events yet." />}
                                    </div>
                                </DashboardPanel>

                                {/* <DashboardPanel>
                                    <PanelHeader title="Visitor overview" />
                                    <div className="flex flex-col items-center p-6">
                                        <div
                                            className="relative grid h-40 w-40 place-items-center rounded-full shadow-inner"
                                            style={{
                                                background: visitorTotal
                                                    ? `conic-gradient(#ec662c 0 ${firstTimePercent}%, #07545c ${firstTimePercent}% 100%)`
                                                    : 'conic-gradient(rgb(0 46 56 / 14%) 0 100%)',
                                            }}
                                        >
                                            <div className="grid h-28 w-28 place-items-center rounded-full border border-midnight-teal/5 bg-[#f9fbfa] text-center shadow-sm">
                                                <div>
                                                    <p className="font-serif text-3xl text-midnight-teal">{visitorTotal}</p>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-midnight-teal/35">Visitors</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-6 grid w-full grid-cols-2 gap-3">
                                            <VisitorStat color="bg-harvest-orange" label="First-time" value={vm.data.visitors.firstTime} />
                                            <VisitorStat color="bg-midnight-teal" label="Returning" value={vm.data.visitors.returning} />
                                        </div>
                                    </div>
                                </DashboardPanel> */}
                            </div>

                            <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
                                {/* <DashboardPanel>
                                    <PanelHeader title="Recent registrations" action="View all" onAction={vm.goToRegistrations} />
                                    {vm.data.recentRegistrations.length ? <RegistrationTable rows={vm.data.recentRegistrations} /> : <EmptyPanel message="No registrations submitted yet." />}
                                </DashboardPanel> */}

                                <DashboardPanel>
                                    <PanelHeader title="Latest announcements" action="View all" onAction={vm.goToContent} />
                                    <div className="divide-y divide-midnight-teal/10 px-5">
                                        {vm.data.latestAnnouncements.length ? vm.data.latestAnnouncements.map(item => <AnnouncementRow key={item.id} item={item} />) : <EmptyPanel message="No active announcements." />}
                                    </div>
                                </DashboardPanel>
                            </div>

                            {/* <DashboardPanel>
                                <PanelHeader title="Quick actions" />
                                <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
                                    <QuickAction icon={<Plus size={18} />} label="New event" onClick={vm.goToContent} />
                                    <QuickAction icon={<Megaphone size={18} />} label="New announcement" onClick={vm.goToContent} />
                                    <QuickAction icon={<UsersRound size={18} />} label="View registrations" onClick={vm.goToRegistrations} />
                                    <QuickAction icon={<UserCog size={18} />} label="Manage users" onClick={vm.goToUsers} />
                                </div>
                            </DashboardPanel> */}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

function DashboardPanel({ children }: { children: React.ReactNode }) {
    return <section className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-xl shadow-midnight-teal/5 backdrop-blur-xl">{children}</section>;
}

function PanelHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
    return <div className="flex items-center justify-between border-b border-midnight-teal/10 px-5 py-4"><h2 className="font-serif text-xl text-midnight-teal">{title}</h2>{action && <button onClick={onAction} className="flex items-center gap-1 text-xs font-bold text-harvest-orange hover:text-midnight-teal">{action}<ArrowRight size={13} /></button>}</div>;
}

function KpiCard({ icon, label, value, accent = false }: { icon: React.ReactNode; label: string; value: number; accent?: boolean }) {
    return <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur-xl"><div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-soft-linen text-midnight-teal">{icon}</span><span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Live</span></div><p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p><p className={`mt-1 font-serif text-3xl ${accent ? 'text-harvest-orange' : 'text-midnight-teal'}`}>{value}</p></div>;
}

function UpcomingEvent({ event }: { event: ChurchEvent }) {
    return <div className="flex items-center gap-4 px-5 py-4"><div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-midnight-teal text-center text-soft-linen"><div><p className="text-[9px] font-bold uppercase tracking-wider">{event.start_date?.date.split(' ')[0] || 'TBA'}</p><p className="font-serif text-xl leading-5">{event.start_date?.date.split(' ')[1] || '—'}</p></div></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold text-midnight-teal">{event.title}</p><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">{event.status || 'active'}</span></div><div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400"><span>{event.start_date ? `${event.start_date.day || ''} ${event.start_date.time}`.trim() : 'Schedule TBA'}</span>{event.location && <span className="flex items-center gap-1"><MapPin size={11} />{event.location}</span>}</div></div></div>;
}

// function VisitorStat({ color, label, value }: { color: string; label: string; value: number }) {
//     return <div className="rounded-xl border border-midnight-teal/5 bg-[#f5f8f7] p-3"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-midnight-teal/40"><span className={`h-2 w-2 rounded-full ${color}`} />{label}</div><p className="mt-1 font-serif text-xl text-midnight-teal">{value}</p></div>;
// }

// function RegistrationTable({ rows }: { rows: DashboardRegistration[] }) {
//     return <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left"><thead className="bg-soft-linen/45 text-[10px] font-bold uppercase tracking-widest text-gray-400"><tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Submitted</th></tr></thead><tbody className="divide-y divide-midnight-teal/10">{rows.map(row => <tr key={row.id}><td className="px-5 py-4"><p className="text-sm font-semibold text-midnight-teal">{row.name}</p><p className="text-xs text-gray-400">{row.email}</p></td><td className="px-5 py-4"><span className="rounded-full bg-soft-linen px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-midnight-teal">{row.type}</span></td><td className="px-5 py-4 text-xs text-gray-400">{formatDate(row.submittedAt)}</td></tr>)}</tbody></table></div>;
// }

function AnnouncementRow({ item }: { item: Announcement }) {
    return <div className="py-4"><div className="flex items-start justify-between gap-3"><p className="font-semibold text-midnight-teal">{item.title}</p><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-700">{item.status || 'active'}</span></div><div className="mt-1 flex items-center gap-2 text-xs text-gray-400">{item.category_content && <span>{item.category_content}</span>}{item.created_at && <span>• {formatDate(item.created_at)}</span>}</div></div>;
}

// function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
//     return <button onClick={onClick} className="flex items-center justify-between rounded-2xl border border-midnight-teal/10 bg-soft-linen/60 px-4 py-4 text-left text-sm font-bold text-midnight-teal transition-all hover:-translate-y-0.5 hover:bg-midnight-teal hover:text-soft-linen"><span className="flex items-center gap-3">{icon}{label}</span><ArrowRight size={15} /></button>;
// }

function EmptyPanel({ message }: { message: string }) {
    return <div className="p-8 text-center text-sm text-gray-400">{message}</div>;
}

function DashboardSkeleton() {
    return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-36 animate-pulse rounded-2xl bg-white" />)}</div><div className="grid gap-6 xl:grid-cols-2"><div className="h-80 animate-pulse rounded-3xl bg-white" /><div className="h-80 animate-pulse rounded-3xl bg-white" /></div></div>;
}

function formatDate(value: string) {
    if (!value) return 'Date unavailable';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(date);
}
