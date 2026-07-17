import { Building2, LogOut, Mail, ShieldCheck, UserRound } from 'lucide-react';
import AdminHeader from '../../../../shared/components/AdminHeader';
import AdminSidebar from '../../../../shared/components/AdminSidebar';
import { useAdminSettingsViewModel } from '../viewmodel/useAdminSettingsViewModel';

export default function AdminSettingsView() {
    const vm = useAdminSettingsViewModel();
    const initials = vm.userName.slice(0, 2).toUpperCase();

    return (
        <div className="admin-shell flex flex-col lg:flex-row">
            <AdminSidebar />
            <div className="relative z-10 flex flex-1 flex-col">
                <AdminHeader userName={vm.userName} />
                <main className="admin-main mx-auto w-full max-w-7xl flex-1 space-y-6 px-6 py-8 lg:px-10">
                    <header>
                        <h1 className="font-serif text-2xl text-midnight-teal">Settings</h1>
                        <p className="mt-1 text-sm text-gray-500">View your account, church assignment, and session controls.</p>
                    </header>

                    <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
                        <section className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-xl shadow-midnight-teal/5 backdrop-blur-xl">
                            <div className="border-b border-midnight-teal/10 px-6 py-5">
                                <h2 className="font-serif text-xl text-midnight-teal">Account information</h2>
                                <p className="mt-1 text-xs text-gray-400">Account details supplied by the authentication service.</p>
                            </div>
                            <div className="p-6">
                                <div className="mb-7 flex items-center gap-4">
                                    {vm.user.profile_picture_url ? <img src={vm.user.profile_picture_url} alt="" className="h-16 w-16 rounded-2xl object-cover shadow" /> : <div className="grid h-16 w-16 place-items-center rounded-2xl bg-midnight-teal font-serif text-xl text-soft-linen shadow">{initials}</div>}
                                    <div><p className="font-serif text-xl text-midnight-teal">{vm.userName}</p><p className="text-sm text-gray-400">{vm.user.email || 'Email not available'}</p></div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <ReadOnlyField icon={<UserRound size={16} />} label="Username" value={vm.user.username || 'Not provided'} />
                                    <ReadOnlyField icon={<Mail size={16} />} label="Email address" value={vm.user.email || 'Not provided'} />
                                    <ReadOnlyField icon={<ShieldCheck size={16} />} label="Roles" value={vm.roles.join(', ')} />
                                    <ReadOnlyField icon={<Building2 size={16} />} label="Home church ID" value={vm.user.home_church_id?.toString() || 'Not assigned'} />
                                </div>
                                <p className="mt-5 rounded-xl bg-soft-linen/70 px-4 py-3 text-xs leading-5 text-midnight-teal/60">These fields are read-only because the backend does not currently provide profile-editing endpoints.</p>
                            </div>
                        </section>

                        <div>
                            <section className="rounded-3xl border border-red-100 bg-white/80 p-6 shadow-xl shadow-midnight-teal/5 backdrop-blur-xl">
                                <h2 className="font-serif text-xl text-midnight-teal">Session & security</h2>
                                <p className="mt-2 text-sm leading-6 text-gray-500">Signing out removes the stored session from this browser.</p>
                                <button onClick={vm.logout} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-600 hover:text-white"><LogOut size={16} /> Log out</button>
                            </section>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

function ReadOnlyField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return <div className="rounded-2xl border border-gray-100 bg-white p-4"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">{icon}{label}</div><p className="mt-2 break-words text-sm font-semibold text-midnight-teal">{value}</p></div>;
}
