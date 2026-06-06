// ─── Admin Events: EventModal (View) ────────────────────────────────────────
import { useEffect, useState } from 'react';
import type { EventFormData } from './adminEvents.types';
import { EMPTY_FORM } from './adminEvents.types';

interface EventModalProps {
    open: boolean;
    title: string;
    initial?: EventFormData;
    onClose: () => void;
    onSave: (data: EventFormData) => void;
}

export function EventModal({ open, title, initial, onClose, onSave }: EventModalProps) {
    const [form, setForm] = useState<EventFormData>(initial ?? EMPTY_FORM);

    useEffect(() => {
        setForm(initial ?? EMPTY_FORM);
    }, [initial, open]);

    if (!open) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setForm(prev => ({ ...prev, image: e.target.files![0] }));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

                {/* Header */}
                <div className="bg-midnight-teal px-6 py-5 flex items-center justify-between">
                    <h2 className="font-serif text-xl text-soft-linen">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-soft-linen/60 hover:text-soft-linen text-2xl leading-none transition-colors"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal mb-1">Title</label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="e.g. Sunday Worship Service"
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal mb-1">Start Date</label>
                            <input
                                type="date"
                                name="start_date_date"
                                value={form.start_date_date}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal mb-1">Start Time</label>
                            <input
                                type="time"
                                name="start_date_time"
                                value={form.start_date_time}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal mb-1">End Date</label>
                            <input
                                type="date"
                                name="end_date_date"
                                value={form.end_date_date}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal mb-1">End Time</label>
                            <input
                                type="time"
                                name="end_date_time"
                                value={form.end_date_time}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal mb-1">Location</label>
                        <input
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            placeholder="e.g. Main Sanctuary"
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal mb-1">Category</label>
                        <input
                            name="category_content"
                            value={form.category_content}
                            onChange={handleChange}
                            placeholder="e.g. Worship, Youth, Prayer"
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal mb-1">Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Brief description of the event..."
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal mb-1">Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-midnight-teal/10 file:text-midnight-teal hover:file:bg-midnight-teal/20"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(form)}
                        className="px-5 py-2 rounded-lg text-sm font-bold bg-midnight-teal text-soft-linen hover:bg-midnight-teal/90 transition-colors"
                    >
                        {initial ? 'Save Changes' : 'Create Event'}
                    </button>
                </div>
            </div>
        </div>
    );
}
