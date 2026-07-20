import { useState } from 'react';
import type { NewPrayerForm } from '../model/adminPrayerWall.types';

export function NewPrayerModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (form: NewPrayerForm) => void }) {
    // Keeps the form hidden until it is opened.
    if (!open) return null;
    return <NewPrayerFormContent onClose={onClose} onSave={onSave} />;
}

function NewPrayerFormContent({ onClose, onSave }: { onClose: () => void; onSave: (form: NewPrayerForm) => void }) {
    const [form, setForm] = useState<NewPrayerForm>({ author: '', message: '', description: '' });
    const labelClass = 'mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-midnight-teal/75';
    const fieldClass = 'w-full rounded-xl border border-midnight-teal/15 bg-[#f3f7f6] px-4 py-3 text-sm text-midnight-teal shadow-sm outline-none transition-all focus:border-harvest-orange/50 focus:bg-white focus:ring-4 focus:ring-harvest-orange/10';

    // Saves only requests that contain a message and description.
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (form.message.trim() && form.description.trim()) onSave(form);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-teal/45 p-4 backdrop-blur-md" onMouseDown={onClose}>
            <form onSubmit={submit} onMouseDown={event => event.stopPropagation()} className="admin-solid-surface w-full max-w-xl overflow-hidden rounded-3xl border border-white/70 shadow-2xl shadow-midnight-teal/30">
                <div className="flex items-center justify-between bg-midnight-teal px-6 py-5">
                    <h2 className="font-serif text-2xl text-soft-linen">New Prayer Request</h2>
                    <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-2xl text-soft-linen/60 hover:bg-white/10 hover:text-soft-linen">&times;</button>
                </div>
                <div className="space-y-5 bg-white p-6 sm:p-7">
                    <label className="block">
                        <span className={labelClass}>Name</span>
                        <input value={form.author} onChange={event => setForm(current => ({ ...current, author: event.target.value }))} placeholder="Leave blank to post anonymously" className={fieldClass} />
                    </label>
                    <label className="block">
                        <span className={labelClass}>Prayer message</span>
                        <input required value={form.message} onChange={event => setForm(current => ({ ...current, message: event.target.value }))} placeholder="Write a short prayer request" className={fieldClass} />
                    </label>
                    <label className="block">
                        <span className={labelClass}>Description</span>
                        <textarea required rows={5} value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} placeholder="Add more details about the prayer request..." className={`${fieldClass} resize-none`} />
                    </label>
                </div>
                <div className="flex justify-end gap-3 border-t border-midnight-teal/10 bg-white px-6 py-4">
                    <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-bold text-midnight-teal/55 hover:bg-midnight-teal/5">Cancel</button>
                    <button type="submit" disabled={!form.message.trim() || !form.description.trim()} className="rounded-xl bg-midnight-teal px-5 py-2.5 text-sm font-bold text-soft-linen shadow-lg disabled:opacity-50">Add Request</button>
                </div>
            </form>
        </div>
    );
}
