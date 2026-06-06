// ─── Admin Registrations: View ──────────────────────────────────────────────
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { useAdminRegistrationsViewModel } from './registrations/useAdminRegistrationsViewModel';
import type { RegistrationTab } from './registrations/useAdminRegistrationsViewModel';
import type { Registration } from './registrations/adminRegistrations.types';
import type { EncounterRegistration } from './registrations/adminEncounterRegistrations.types';
import type { DiscipleshipRegistration } from './registrations/adminDiscipleshipRegistrations.types';

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS: { id: RegistrationTab; label: string; icon: React.ReactNode }[] = [
    {
        id: 'plan-a-visit',
        label: 'Plan a Visit',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        id: 'encounter',
        label: 'Encounter',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
        ),
    },
    {
        id: 'discipleship',
        label: 'Discipleship',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtDate(str: string) {
    return new Date(str).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
function truncate(str: string | null, len = 60) {
    if (!str) return '—';
    return str.length > len ? str.slice(0, len) + '…' : str;
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function AdminRegistrations() {
    const vm = useAdminRegistrationsViewModel();

    const tabCount = {
        'plan-a-visit': vm.registrations.length,
        'encounter': vm.encounterRegistrations.length,
        'discipleship': vm.discipleshipRegistrations.length,
    };

    return (
        <div className="flex min-h-screen bg-soft-linen">
            <AdminSidebar />

            <div className="flex-1 flex flex-col">
                <AdminHeader userName="Admin" />

                <main className="p-6 flex-1 space-y-6">
                    {/* ── Page Title ─────────────────────────────────── */}
                    <div>
                        <h1 className="text-2xl font-serif text-midnight-teal">Registrations</h1>
                        <p className="text-sm text-gray-400 mt-0.5">
                            Manage all church registrations across forms.
                        </p>
                    </div>

                    {/* ── Tab Filter Bar ──────────────────────────────── */}
                    <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm">
                        {TABS.map(tab => {
                            const isActive = vm.activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => vm.setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200
                                        ${isActive
                                            ? 'bg-midnight-teal text-soft-linen shadow'
                                            : 'text-gray-400 hover:text-midnight-teal'}`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                                        ${isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                                        {tabCount[tab.id]}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* ── Stats ──────────────────────────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                                Total Registrations
                            </p>
                            <p className="text-3xl font-serif text-midnight-teal">{vm.stats.total}</p>
                        </div>

                        {vm.activeTab === 'plan-a-visit' && (
                            <>
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                                        First-Time Guests
                                    </p>
                                    <p className="text-3xl font-serif text-harvest-orange">{vm.stats.statA}</p>
                                </div>
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                                        Returning Guests
                                    </p>
                                    <p className="text-3xl font-serif text-midnight-teal">{vm.stats.statB}</p>
                                </div>
                            </>
                        )}

                        {vm.activeTab === 'encounter' && (
                            <>
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                                        Encounter Sign-ups
                                    </p>
                                    <p className="text-3xl font-serif text-harvest-orange">{vm.stats.statA}</p>
                                </div>
                            </>
                        )}

                        {vm.activeTab === 'discipleship' && (
                            <>
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                                        This Week
                                    </p>
                                    <p className="text-3xl font-serif text-harvest-orange">
                                        {vm.discipleshipRegistrations.filter(r => {
                                            const d = new Date(r.submitted_at);
                                            const now = new Date();
                                            const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
                                            return diff <= 7;
                                        }).length}
                                    </p>
                                </div>
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                                        This Month
                                    </p>
                                    <p className="text-3xl font-serif text-midnight-teal">
                                        {vm.discipleshipRegistrations.filter(r => {
                                            const d = new Date(r.submitted_at);
                                            const now = new Date();
                                            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                                        }).length}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* ── Search ─────────────────────────────────────── */}
                    <div className="relative max-w-md">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z" />
                        </svg>
                        <input
                            value={vm.search}
                            onChange={e => vm.setSearch(e.target.value)}
                            placeholder={
                                vm.activeTab === 'plan-a-visit' ? 'Search by name or email…' :
                                    'Search by name, email or message…'
                            }
                            className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-midnight-teal/30 shadow-sm"
                        />
                    </div>

                    {/* ── Content ────────────────────────────────────── */}
                    {vm.isLoading ? (
                        <div className="flex flex-col gap-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl h-16 animate-pulse border border-gray-100" />
                            ))}
                        </div>
                    ) : vm.error ? (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                            <p className="text-red-500 text-sm font-semibold">{vm.error}</p>
                            <button onClick={vm.retry} className="mt-3 text-xs font-bold text-midnight-teal underline">
                                Retry
                            </button>
                        </div>
                    ) : vm.activeTab === 'plan-a-visit' ? (
                        <PlanAVisitTable rows={vm.paginatedRegistrations} />
                    ) : vm.activeTab === 'encounter' ? (
                        <EncounterTable rows={vm.paginatedEncounterRegistrations} />
                    ) : (
                        <DiscipleshipTable rows={vm.paginatedDiscipleshipRegistrations} />
                    )}

                    {/* ── Pagination ─────────────────────────────────── */}
                    {!vm.isLoading && !vm.error && (
                        <div className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-sm mt-6">
                            <button
                                onClick={() => vm.setPage(Math.max(1, vm.page - 1))}
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
                                Page {vm.page} of {vm.totalPages}
                            </span>
                            <button
                                onClick={() => vm.setPage(Math.min(vm.totalPages, vm.page + 1))}
                                disabled={vm.page === vm.totalPages}
                                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                                    vm.page === vm.totalPages 
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
        </div>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
    return (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-soft-linen flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-midnight-teal/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            </div>
            <p className="font-serif text-lg text-midnight-teal">{message}</p>
        </div>
    );
}

// ─── Shared table wrapper ─────────────────────────────────────────────────────
function TableWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500">
                    {children}
                </table>
            </div>
        </div>
    );
}

function Th({ children }: { children: React.ReactNode }) {
    return (
        <th className="px-6 py-4 font-bold tracking-wider">{children}</th>
    );
}

// ─── Plan a Visit table ───────────────────────────────────────────────────────
function PlanAVisitTable({ rows }: { rows: Registration[] }) {
    if (rows.length === 0) return <EmptyState message="No plan-a-visit registrations found" />;

    const serviceLabel = (s: string | null) => {
        if (s === 'sunday-10am') return '10:00 AM';
        if (s === 'sunday-2pm') return '2:00 PM';
        return s ?? '—';
    };

    return (
        <TableWrapper>
            <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                    <Th>Name</Th>
                    <Th>Contact</Th>
                    <Th>Service</Th>
                    <Th>Guests</Th>
                    <Th>Type</Th>
                    <Th>Date</Th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {rows.map(reg => (
                    <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-midnight-teal">
                            {reg.first_name} {reg.last_name}
                        </td>
                        <td className="px-6 py-4">{reg.email}</td>
                        <td className="px-6 py-4">{serviceLabel(reg.service_type)}</td>
                        <td className="px-6 py-4">
                            {reg.adult_count ?? 0} Adults, {reg.child_count ?? 0} Kids
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full ${reg.visitor_status === 'first_time'
                                ? 'bg-harvest-orange/10 text-harvest-orange border border-harvest-orange/20'
                                : 'bg-midnight-teal/10 text-midnight-teal border border-midnight-teal/20'
                                }`}>
                                {reg.visitor_status === 'first_time' ? 'First Time' : 'Returning'}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-xs">{fmtDate(reg.submitted_at)}</td>
                    </tr>
                ))}
            </tbody>
        </TableWrapper>
    );
}

// ─── Encounter table ──────────────────────────────────────────────────────────
function EncounterTable({ rows }: { rows: EncounterRegistration[] }) {
    if (rows.length === 0) return <EmptyState message="No encounter registrations found" />;

    return (
        <TableWrapper>
            <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Phone</Th>
                    <Th>Inspiration</Th>
                    <Th>Date</Th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {rows.map(reg => (
                    <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-midnight-teal">
                            {reg.first_name} {reg.last_name}
                        </td>
                        <td className="px-6 py-4">{reg.email ?? '—'}</td>
                        <td className="px-6 py-4">{reg.phone ?? '—'}</td>
                        <td className="px-6 py-4 text-xs text-gray-400 max-w-xs">
                            {truncate(reg.inspiration)}
                        </td>
                        <td className="px-6 py-4 text-xs">{fmtDate(reg.submitted_at)}</td>
                    </tr>
                ))}
            </tbody>
        </TableWrapper>
    );
}

// ─── Discipleship table ───────────────────────────────────────────────────────
function DiscipleshipTable({ rows }: { rows: DiscipleshipRegistration[] }) {
    if (rows.length === 0) return <EmptyState message="No discipleship submissions found" />;

    return (
        <TableWrapper>
            <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Message</Th>
                    <Th>Date</Th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {rows.map(reg => (
                    <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-midnight-teal">
                            {reg.name ?? '—'}
                        </td>
                        <td className="px-6 py-4">{reg.email ?? '—'}</td>
                        <td className="px-6 py-4 text-xs text-gray-400 max-w-sm">
                            {truncate(reg.message, 80)}
                        </td>
                        <td className="px-6 py-4 text-xs">{fmtDate(reg.submitted_at)}</td>
                    </tr>
                ))}
            </tbody>
        </TableWrapper>
    );
}
