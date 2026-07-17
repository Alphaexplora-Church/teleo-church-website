// ─── Admin Events: EventModal (View) ────────────────────────────────────────
import { useState } from 'react';
import type { EventFormData } from '../model/adminEvents.types';
import { EMPTY_FORM } from '../model/adminEvents.types';

interface EventModalProps {
    title: string;
    initial?: EventFormData;
    onClose: () => void;
    onSave: (data: EventFormData) => void;
}

export function EventModal({ title, initial, onClose, onSave }: EventModalProps) {
    const [form, setForm] = useState<EventFormData>(initial ?? EMPTY_FORM);
    const labelClass = 'mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-midnight-teal/75';
    const fieldClass = 'w-full rounded-xl border border-midnight-teal/10 bg-white/90 px-4 py-3 text-sm text-midnight-teal shadow-sm outline-none transition-all placeholder:text-midnight-teal/30 focus:border-harvest-orange/50 focus:ring-4 focus:ring-harvest-orange/10';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setForm(prev => ({ ...prev, image: e.target.files![0] }));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-teal/45 p-4 backdrop-blur-md">
            <div className="admin-modal-surface max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/70 bg-[#f7faf8] shadow-2xl shadow-midnight-teal/30">

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-midnight-teal/95 px-6 py-5 backdrop-blur-xl">
                    <h2 className="font-serif text-2xl text-soft-linen">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none text-soft-linen/60 transition-colors hover:bg-white/10 hover:text-soft-linen"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-5 bg-[#f7faf8]/95 p-6 sm:p-7">
                    <div>
                        <label className={labelClass}>Title</label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="e.g. Sunday Worship Service"
                            className={fieldClass}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>Start Date</label>
                            <input
                                type="date"
                                name="start_date_date"
                                value={form.start_date_date}
                                onChange={handleChange}
                                className={fieldClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Start Time</label>
                            <input
                                type="time"
                                name="start_date_time"
                                value={form.start_date_time}
                                onChange={handleChange}
                                className={fieldClass}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>End Date</label>
                            <input
                                type="date"
                                name="end_date_date"
                                value={form.end_date_date}
                                onChange={handleChange}
                                className={fieldClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>End Time</label>
                            <input
                                type="time"
                                name="end_date_time"
                                value={form.end_date_time}
                                onChange={handleChange}
                                className={fieldClass}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Location</label>
                        <input
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            placeholder="e.g. Main Sanctuary"
                            className={fieldClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Category</label>
                        <input
                            name="category_content"
                            value={form.category_content}
                            onChange={handleChange}
                            placeholder="e.g. Worship, Youth, Prayer"
                            className={fieldClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Brief description of the event..."
                            className={`${fieldClass} resize-none`}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className={`${fieldClass} cursor-pointer file:mr-4 file:rounded-lg file:border-0 file:bg-midnight-teal/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-midnight-teal hover:file:bg-midnight-teal/15`}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex justify-end gap-3 border-t border-midnight-teal/10 bg-white/85 px-6 py-4 backdrop-blur-xl">
                    <button
                        onClick={onClose}
                        className="rounded-xl px-5 py-2.5 text-sm font-bold text-midnight-teal/55 transition-colors hover:bg-midnight-teal/5 hover:text-midnight-teal"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(form)}
                        className="rounded-xl bg-midnight-teal px-5 py-2.5 text-sm font-bold text-soft-linen shadow-lg shadow-midnight-teal/15 transition-all hover:-translate-y-0.5 hover:bg-deep-teal"
                    >
                        {initial ? 'Save Changes' : 'Create Event'}
                    </button>
                </div>
            </div>
        </div>
    );
}
