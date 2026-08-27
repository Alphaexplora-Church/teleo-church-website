// ─── Admin Content — PartModal (View) ───────────────────────────────────────
// Handles the "Content Addition Alternatives" from the spec: a Part may
// carry a validated video link (A), a written passage (B), or both (C),
// plus the "Validation & Error Handling" flow for invalid/broken links.
import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import type { JourneyPart, PartContentType, PartFormData, PartStatus } from '../model/adminContent.types';
import { EMPTY_PART_FORM } from '../model/adminContent.types';
import { validateVideoLink, type VideoPreview } from '../model/adminContent.service';
import { useModalTransition } from '../../../../shared/hooks/useModalTransition';
import { fieldClass, labelClass, modalOverlayClass, modalPanelClass, segmentedButtonClass } from './contentStyles';

interface PartModalProps {
    title: string;
    initial?: JourneyPart;
    onClose: () => void;
    onSave: (form: PartFormData, preview: VideoPreview | null) => void;
}

const TYPE_OPTIONS: { value: PartContentType; label: string }[] = [
    { value: 'video', label: 'Video Link' },
    { value: 'text', label: 'Written Passage' },
    { value: 'both', label: 'Video + Passage' },
];

export function PartModal({ title, initial, onClose, onSave }: PartModalProps) {
    const { visible, requestClose } = useModalTransition(onClose);
    const [form, setForm] = useState<PartFormData>(initial ? {
        title: initial.title,
        type: initial.type,
        status: initial.status,
        videoUrl: initial.videoUrl ?? '',
        textContent: initial.textContent ?? '',
    } : EMPTY_PART_FORM);

    const [preview, setPreview] = useState<VideoPreview | null>(
        initial?.videoTitle ? { title: initial.videoTitle, thumbnail: initial.videoThumbnail ?? '' } : null,
    );
    const [linkState, setLinkState] = useState<'idle' | 'checking' | 'valid' | 'invalid'>(
        initial?.videoTitle ? 'valid' : 'idle',
    );

    const needsVideo = form.type === 'video' || form.type === 'both';
    const needsText = form.type === 'text' || form.type === 'both';

    const handleValidateLink = async () => {
        if (!form.videoUrl.trim()) {
            setLinkState('invalid');
            setPreview(null);
            return;
        }
        setLinkState('checking');
        const result = await validateVideoLink(form.videoUrl);
        if (result) {
            setPreview(result);
            setLinkState('valid');
        } else {
            setPreview(null);
            setLinkState('invalid');
        }
    };

    const canSave = form.title.trim().length > 0
        && (!needsVideo || (form.videoUrl.trim().length > 0 && linkState === 'valid'))
        && (!needsText || form.textContent.trim().length > 0);

    return (
        <div className={`z-[60] ${modalOverlayClass(visible)}`}>
            <div className={`max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/70 bg-[#f7faf8] shadow-2xl shadow-midnight-teal/30 ${modalPanelClass(visible)}`}>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-midnight-teal/95 px-6 py-5 backdrop-blur-xl">
                    <h2 className="font-serif text-2xl text-soft-linen">{title}</h2>
                    <button onClick={requestClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full text-soft-linen/60 transition-colors hover:bg-white/10 hover:text-soft-linen"><X size={18} /></button>
                </div>

                <div className="space-y-5 bg-[#f7faf8]/95 p-6 sm:p-7">
                    <div>
                        <label className={labelClass}>Part Title</label>
                        <input value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. Part 1 — The Foundation" className={fieldClass} />
                    </div>

                    <div>
                        <label className={labelClass}>Content Type</label>
                        <div className="flex flex-wrap gap-2">
                            {TYPE_OPTIONS.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, type: option.value }))}
                                    className={segmentedButtonClass(form.type === option.value)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {needsVideo && (
                        <div>
                            <label className={labelClass}>Video Link</label>
                            <div className="flex gap-2">
                                <input
                                    value={form.videoUrl}
                                    onChange={e => { setForm(prev => ({ ...prev, videoUrl: e.target.value })); setLinkState('idle'); setPreview(null); }}
                                    placeholder="Paste a YouTube or Vimeo link…"
                                    className={fieldClass}
                                />
                                <button
                                    type="button"
                                    onClick={() => void handleValidateLink()}
                                    disabled={linkState === 'checking'}
                                    className="shrink-0 rounded-xl bg-midnight-teal px-4 text-sm font-bold text-soft-linen transition-colors hover:bg-deep-teal disabled:opacity-60"
                                >
                                    {linkState === 'checking' ? <Loader2 size={16} className="animate-spin" /> : 'Check'}
                                </button>
                            </div>

                            {linkState === 'checking' && <p className="mt-2 text-xs font-semibold text-gray-400">Validating link…</p>}

                            {linkState === 'invalid' && (
                                <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-500">
                                    <AlertCircle size={14} /> This link couldn't be used. Fix or replace it before saving.
                                </p>
                            )}

                            {linkState === 'valid' && preview && (
                                <div className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                                    {preview.thumbnail && <img src={preview.thumbnail} alt="" className="h-14 w-24 shrink-0 rounded-lg object-cover" />}
                                    <div className="min-w-0">
                                        <p className="flex items-center gap-1 text-xs font-bold text-emerald-700"><CheckCircle2 size={13} /> Preview ready</p>
                                        <p className="truncate text-sm font-semibold text-midnight-teal">{preview.title}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {needsText && (
                        <div>
                            <label className={labelClass}>Written Passage</label>
                            <textarea
                                value={form.textContent}
                                onChange={e => setForm(prev => ({ ...prev, textContent: e.target.value }))}
                                rows={6}
                                placeholder="Write or paste the reading passage…"
                                className={`${fieldClass} resize-none`}
                            />
                        </div>
                    )}

                    <div>
                        <label className={labelClass}>Part Status</label>
                        <select
                            value={form.status}
                            onChange={e => setForm(prev => ({ ...prev, status: e.target.value as PartStatus }))}
                            className={fieldClass}
                        >
                            <option value="draft">Draft — hidden from members</option>
                            <option value="published">Published</option>
                        </select>
                        <p className="mt-1.5 text-xs text-gray-400">A journey can only be published once at least one Part is Published.</p>
                    </div>
                </div>

                <div className="sticky bottom-0 flex justify-end gap-3 border-t border-midnight-teal/10 bg-white/85 px-6 py-4 backdrop-blur-xl">
                    <button onClick={requestClose} className="rounded-xl px-5 py-2.5 text-sm font-bold text-midnight-teal/55 transition-colors hover:bg-midnight-teal/5 hover:text-midnight-teal">Cancel</button>
                    <button
                        onClick={() => onSave(form, preview)}
                        disabled={!canSave}
                        className="rounded-xl bg-midnight-teal px-5 py-2.5 text-sm font-bold text-soft-linen shadow-lg shadow-midnight-teal/15 transition-all hover:-translate-y-0.5 hover:bg-deep-teal disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                    >
                        {initial ? 'Save Part' : 'Add Part'}
                    </button>
                </div>
            </div>
        </div>
    );
}
