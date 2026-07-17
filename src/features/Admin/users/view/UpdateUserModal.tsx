import { useState } from 'react';
import type { ManagedUser, UserUpdateForm } from '../model/adminUsers.types';

interface UpdateUserModalProps {
    user: ManagedUser | null;
    onClose: () => void;
    onSave: (form: UserUpdateForm) => void;
}

// Roles defined by the backend database seed.
const USER_ROLES = [
    'Church Admin',
    'Content Moderator',
    'Pastor/Leader',
    'Member/Staff',
    'Normal User / Non-Member',
    'Guest',
] as const;

export function UpdateUserModal({ user, onClose, onSave }: UpdateUserModalProps) {
    if (!user) return null;
    return <UpdateUserForm key={user.id} user={user} onClose={onClose} onSave={onSave} />;
}

function UpdateUserForm({ user, onClose, onSave }: { user: ManagedUser; onClose: () => void; onSave: (form: UserUpdateForm) => void }) {
    // Converts the old admin role to the backend role name.
    const initialRole = USER_ROLES.includes(user.role as typeof USER_ROLES[number])
        ? user.role
        : user.role.toLowerCase() === 'admin' ? 'Church Admin' : USER_ROLES[0];
    const [form, setForm] = useState<UserUpdateForm>({ username: user.username, email: user.email, role: initialRole });
    const labelClass = 'mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-midnight-teal/75';
    const fieldClass = 'w-full rounded-xl border border-midnight-teal/10 px-4 py-3 text-sm text-midnight-teal shadow-sm outline-none transition-all placeholder:text-midnight-teal/30 focus:border-harvest-orange/50 focus:ring-4 focus:ring-harvest-orange/10';
    // Gives locked fields a clear read-only appearance.
    const readOnlyFieldClass = `${fieldClass} cursor-not-allowed bg-midnight-teal/[0.045] text-midnight-teal/65`;

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        onSave({ username: form.username.trim(), email: form.email.trim(), role: form.role.trim() });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-teal/45 p-4 backdrop-blur-md" onMouseDown={onClose}>
            <form onSubmit={submit} onMouseDown={event => event.stopPropagation()} className="admin-solid-surface max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/70 shadow-2xl shadow-midnight-teal/30">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-midnight-teal/95 px-6 py-5 backdrop-blur-xl">
                    <h2 className="font-serif text-2xl text-soft-linen">Update User</h2>
                    <button type="button" onClick={onClose} aria-label="Close update form" className="flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none text-soft-linen/60 transition-colors hover:bg-white/10 hover:text-soft-linen">&times;</button>
                </div>
                <div className="space-y-5 bg-white p-6 sm:p-7">
                    {/* Account identity cannot be changed here. */}
                    <ReadOnlyField label="Username" value={form.username} fieldClass={readOnlyFieldClass} labelClass={labelClass} />
                    <ReadOnlyField label="Email" value={form.email} type="email" fieldClass={readOnlyFieldClass} labelClass={labelClass} />

                    {/* Only the user's role can be updated. */}
                    <label className="block">
                        <span className={labelClass}>Role</span>
                        <select
                            required
                            value={form.role}
                            onChange={event => setForm(current => ({ ...current, role: event.target.value }))}
                            className={`${fieldClass} cursor-pointer bg-white`}
                        >
                            {/* Backend-supported role choices */}
                            {USER_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                    </label>
                </div>
                <div className="sticky bottom-0 flex justify-end gap-3 border-t border-midnight-teal/10 bg-white/85 px-6 py-4 backdrop-blur-xl">
                    <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-bold text-midnight-teal/55 transition-colors hover:bg-midnight-teal/5 hover:text-midnight-teal">Cancel</button>
                    <button type="submit" disabled={!form.username.trim() || !form.email.trim() || !form.role.trim()} className="rounded-xl bg-midnight-teal px-5 py-2.5 text-sm font-bold text-soft-linen shadow-lg shadow-midnight-teal/15 transition-all hover:-translate-y-0.5 hover:bg-deep-teal disabled:cursor-not-allowed disabled:opacity-50">Save Changes</button>
                </div>
            </form>
        </div>
    );
}

function ReadOnlyField({ label, value, type = 'text', labelClass, fieldClass }: { label: string; value: string; type?: string; labelClass: string; fieldClass: string }) {
    // Displays account details without allowing edits.
    return (
        <label className="block">
            <span className={labelClass}>{label}</span>
            <input readOnly aria-readonly="true" type={type} value={value} className={fieldClass} />
        </label>
    );
}
