import { Pencil } from 'lucide-react';
import AdminHeader from '../../../../shared/components/AdminHeader';
import AdminSidebar from '../../../../shared/components/AdminSidebar';
import { useAdminUsersViewModel } from '../viewmodel/useAdminUsersViewModel';
import { UpdateUserModal } from './UpdateUserModal';

export default function AdminUsersView() {
    const vm = useAdminUsersViewModel();

    return (
        <div className="admin-shell flex flex-col lg:flex-row">
            <AdminSidebar />
            <div className="relative z-10 flex flex-1 flex-col">
                <AdminHeader userName="Admin" />
                <main className="admin-main mx-auto w-full max-w-7xl flex-1 space-y-6 px-6 py-8 lg:px-10">
                    <header>
                        <h1 className="font-serif text-2xl text-midnight-teal">User Account Management</h1>
                        <p className="mt-1 text-sm text-gray-500">View and update user account information.</p>
                    </header>

                    <section className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-xl shadow-midnight-teal/5 backdrop-blur-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] border-collapse text-left">
                                <thead className="border-b border-midnight-teal/10 bg-soft-linen/55">
                                    <tr>
                                        <TableHeading>Username</TableHeading>
                                        <TableHeading>Email</TableHeading>
                                        <TableHeading>Role</TableHeading>
                                        <TableHeading align="right">Actions</TableHeading>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-midnight-teal/10">
                                    {vm.users.map(user => (
                                        <tr key={user.id} className="transition-colors hover:bg-soft-linen/35">
                                            <TableCell><span className="font-semibold text-midnight-teal">{user.username}</span></TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell><span className="rounded-full bg-midnight-teal/8 px-3 py-1 text-xs font-bold uppercase tracking-wider text-midnight-teal">{user.role}</span></TableCell>
                                            <TableCell align="right"><button onClick={() => vm.openUpdate(user)} className="inline-flex items-center gap-2 rounded-xl bg-midnight-teal px-4 py-2 text-sm font-bold text-soft-linen shadow-sm transition-colors hover:bg-harvest-orange"><Pencil size={14} /> Update</button></TableCell>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>

            {vm.toast && <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-midnight-teal px-5 py-3 text-sm font-semibold text-soft-linen shadow-xl">{vm.toast}</div>}
            <UpdateUserModal user={vm.updateTarget} onClose={vm.closeUpdate} onSave={vm.updateUser} />
        </div>
    );
}

function TableHeading({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
    return <th className={`px-6 py-4 text-xs font-bold uppercase tracking-widest text-midnight-teal/55 ${align === 'right' ? 'text-right' : ''}`}>{children}</th>;
}

function TableCell({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
    return <td className={`px-6 py-5 text-sm text-midnight-teal/70 ${align === 'right' ? 'text-right' : ''}`}>{children}</td>;
}
