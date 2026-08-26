// ─── Admin Content — JourneyEditor (View) ───────────────────────────────────
// Covers Phase 1 (Create Series) and Phase 1.1 (Edit and Update Series):
// metadata + the Series builder for adding/editing Parts, with Publish
// gated on at least one Published Part, and the edit-flow rule that saving
// retains the journey's current status unless the Pastor explicitly Publishes.
import { useState } from 'react';
import { ArrowDown, ArrowUp, FileText, ImageOff, Loader2, Pencil, Plus, Trash2, Video } from 'lucide-react';
import type { Journey, JourneyFormData, JourneyPart, PartFormData } from '../model/adminContent.types';
import { CATEGORY_OPTIONS, CONTENT_TYPE_OPTIONS, EMPTY_JOURNEY_FORM, canPublishJourney } from '../model/adminContent.types';
import { AdminContentService, buildPart, type VideoPreview } from '../model/adminContent.service';
import { useModalTransition } from '../../../../shared/hooks/useModalTransition';
import { PartModal } from './PartModal';

interface JourneyEditorProps {
    journey: Journey | null;
    onClose: () => void;
    onSaved: (journey: Journey, isNew: boolean) => void;
    showToast: (msg: string, type?: 'success' | 'error') => void;
}

const labelClass = 'mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-midnight-teal/75';
const fieldClass = 'w-full rounded-xl border border-midnight-teal/10 bg-white/90 px-4 py-3 text-sm text-midnight-teal shadow-sm outline-none transition-all placeholder:text-midnight-teal/30 focus:border-harvest-orange/50 focus:ring-4 focus:ring-harvest-orange/10';

export function JourneyEditor({ journey, onClose, onSaved, showToast }: JourneyEditorProps) {
    const { visible, requestClose } = useModalTransition(onClose);
    const isNew = !journey;
    const [form, setForm] = useState<JourneyFormData>(journey ? {
        title: journey.title,
        description: journey.description,
        contentType: journey.contentType,
        categories: journey.categories,
        summary: journey.summary ?? '',
    } : EMPTY_JOURNEY_FORM);
    const [parts, setParts] = useState<JourneyPart[]>(journey?.parts ?? []);
    const [isSaving, setIsSaving] = useState(false);
    const [partModal, setPartModal] = useState<{ mode: 'add' } | { mode: 'edit'; part: JourneyPart } | null>(null);

    const toggleCategory = (category: string) => {
        setForm(prev => ({
            ...prev,
            categories: prev.categories.includes(category)
                ? prev.categories.filter(item => item !== category)
                : [...prev.categories, category],
        }));
    };

    const reorder = (index: number, direction: -1 | 1) => {
        setParts(prev => {
            const next = [...prev];
            const swapIndex = index + direction;
            if (swapIndex < 0 || swapIndex >= next.length) return prev;
            [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
            return next.map((part, i) => ({ ...part, order: i + 1 }));
        });
    };

    const removePart = (id: string) => {
        setParts(prev => prev.filter(part => part.id !== id).map((part, i) => ({ ...part, order: i + 1 })));
    };

    const handlePartSave = (data: PartFormData, preview: VideoPreview | null) => {
        if (partModal?.mode === 'edit') {
            const built = buildPart(data, partModal.part);
            if (preview) { built.videoTitle = preview.title; built.videoThumbnail = preview.thumbnail; }
            setParts(prev => prev.map(part => part.id === built.id ? built : part));
        } else {
            const built = buildPart(data, undefined, parts.length + 1);
            if (preview) { built.videoTitle = preview.title; built.videoThumbnail = preview.thumbnail; }
            setParts(prev => [...prev, built]);
        }
        setPartModal(null);
    };

    const isMetadataValid = form.title.trim().length > 0 && form.description.trim().length > 0 && form.categories.length > 0;
    const isPublishable = canPublishJourney(parts);

    const persist = async (nextStatus?: 'draft' | 'published') => {
        if (!isMetadataValid) {
            showToast('Title, description, and at least one category are required.', 'error');
            return;
        }
        // Publish action is gated on ≥1 Published Part — applies to both a
        // first-time Publish and a "Save Changes" that keeps a journey published.
        const willBePublished = nextStatus === 'published' || (nextStatus === undefined && journey?.status === 'published');
        if (willBePublished && !isPublishable) {
            showToast('A journey needs at least one Published Part before it can be published.', 'error');
            return;
        }

        setIsSaving(true);
        try {
            let saved: Journey;
            if (journey) {
                // Rule: editing content retains its current status unless the
                // Pastor explicitly Publishes from this screen.
                saved = await AdminContentService.saveJourney(journey.id, form, parts, nextStatus ?? journey.status);
                showToast(nextStatus === 'published' ? `“${saved.title}” published.` : `“${saved.title}” updated.`);
            } else {
                const created = await AdminContentService.createJourney(form);
                saved = await AdminContentService.saveJourney(created.id, form, parts, nextStatus ?? 'draft');
                showToast(nextStatus === 'published' ? `“${saved.title}” published.` : `“${saved.title}” saved as draft.`);
            }
            onSaved(saved, isNew);
            requestClose();
        } catch {
            showToast('Failed to save the journey.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-midnight-teal/45 p-4 backdrop-blur-md transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/70 bg-[#f7faf8] shadow-2xl shadow-midnight-teal/30 transition-all duration-200 ease-out ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-midnight-teal/95 px-6 py-5 backdrop-blur-xl">
                    <div>
                        <h2 className="font-serif text-2xl text-soft-linen">{journey ? 'Edit Journey' : 'New Journey'}</h2>
                        {journey && <p className="text-xs font-semibold uppercase tracking-widest text-soft-linen/50">Currently {journey.status}</p>}
                    </div>
                    <button onClick={requestClose} className="flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none text-soft-linen/60 transition-colors hover:bg-white/10 hover:text-soft-linen">×</button>
                </div>

                <div className="space-y-8 bg-[#f7faf8]/95 p-6 sm:p-7">
                    {/* ── Metadata ─────────────────────────────────────── */}
                    <section className="space-y-5">
                        <h3 className="font-serif text-lg text-midnight-teal">Journey Details</h3>

                        <div>
                            <label className={labelClass}>Title</label>
                            <input value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. Rooted: A Journey Through Colossians" className={fieldClass} />
                        </div>

                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} rows={3} placeholder="What is this series about?" className={`${fieldClass} resize-none`} />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Content Type</label>
                                <select value={form.contentType} onChange={e => setForm(prev => ({ ...prev, contentType: e.target.value as JourneyFormData['contentType'] }))} className={fieldClass}>
                                    {CONTENT_TYPE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Summary <span className="normal-case font-semibold text-midnight-teal/40">(optional)</span></label>
                                <input value={form.summary} onChange={e => setForm(prev => ({ ...prev, summary: e.target.value }))} placeholder="Short teaser for listings" className={fieldClass} />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Categories</label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORY_OPTIONS.map(category => {
                                    const active = form.categories.includes(category);
                                    return (
                                        <button key={category} type="button" onClick={() => toggleCategory(category)} className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${active ? 'bg-harvest-orange text-white shadow' : 'border border-midnight-teal/15 bg-white text-midnight-teal/60 hover:text-midnight-teal'}`}>
                                            {category}
                                        </button>
                                    );
                                })}
                            </div>
                            {form.categories.length === 0 && <p className="mt-1.5 text-xs text-gray-400">Select at least one category.</p>}
                        </div>
                    </section>

                    {/* ── Series builder ───────────────────────────────── */}
                    <section className="space-y-4 border-t border-midnight-teal/10 pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-serif text-lg text-midnight-teal">Series Builder</h3>
                                <p className="text-xs text-gray-400">Add each part in order. A part may include a video, a written passage, or both.</p>
                            </div>
                            <button onClick={() => setPartModal({ mode: 'add' })} className="flex shrink-0 items-center gap-1.5 rounded-xl bg-midnight-teal px-4 py-2 text-sm font-bold text-soft-linen shadow transition-colors hover:bg-deep-teal">
                                <Plus size={15} /> Add Part
                            </button>
                        </div>

                        {parts.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-midnight-teal/15 bg-white/60 p-8 text-center">
                                <p className="text-sm font-semibold text-midnight-teal/50">No parts yet. Add your first part to build the series.</p>
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {parts.map((part, index) => (
                                    <li key={part.id} className="animate-fade-in-up">
                                        <PartRow part={part} index={index} total={parts.length} onMoveUp={() => reorder(index, -1)} onMoveDown={() => reorder(index, 1)} onEdit={() => setPartModal({ mode: 'edit', part })} onRemove={() => removePart(part.id)} />
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold ${isPublishable ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {isPublishable ? 'Ready to publish — at least one Part is Published.' : 'Publish is locked until at least one Part is set to Published.'}
                        </div>
                    </section>
                </div>

                <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-midnight-teal/10 bg-white/85 px-6 py-4 backdrop-blur-xl sm:flex-row sm:justify-end">
                    <button onClick={requestClose} disabled={isSaving} className="rounded-xl px-5 py-2.5 text-sm font-bold text-midnight-teal/55 transition-colors hover:bg-midnight-teal/5 hover:text-midnight-teal disabled:cursor-not-allowed disabled:opacity-50">Cancel</button>
                    <button onClick={() => void persist('draft')} disabled={isSaving} className="flex items-center justify-center gap-2 rounded-xl border border-midnight-teal/15 bg-white px-5 py-2.5 text-sm font-bold text-midnight-teal transition-colors hover:bg-midnight-teal/5 disabled:opacity-50">
                        {isSaving && <Loader2 size={14} className="animate-spin" />} Save as Draft
                    </button>
                    {journey?.status === 'published' ? (
                        <button onClick={() => void persist('published')} disabled={isSaving} className="flex items-center justify-center gap-2 rounded-xl bg-midnight-teal px-5 py-2.5 text-sm font-bold text-soft-linen shadow-lg shadow-midnight-teal/15 transition-all hover:-translate-y-0.5 hover:bg-deep-teal disabled:opacity-50 disabled:hover:translate-y-0">
                            {isSaving && <Loader2 size={14} className="animate-spin" />} Save Changes
                        </button>
                    ) : (
                        <button
                            onClick={() => void persist('published')}
                            disabled={isSaving || !isPublishable}
                            title={!isPublishable ? 'Add at least one Published Part first' : undefined}
                            className="flex items-center justify-center gap-2 rounded-xl bg-harvest-orange px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-harvest-orange/25 transition-all hover:-translate-y-0.5 hover:bg-harvest-orange/90 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:hover:translate-y-0"
                        >
                            {isSaving && <Loader2 size={14} className="animate-spin" />} Publish Series
                        </button>
                    )}
                </div>
            </div>

            {partModal && (
                <PartModal
                    title={partModal.mode === 'edit' ? 'Edit Part' : 'Add Part'}
                    initial={partModal.mode === 'edit' ? partModal.part : undefined}
                    onClose={() => setPartModal(null)}
                    onSave={handlePartSave}
                />
            )}
        </div>
    );
}

function PartRow({ part, index, total, onMoveUp, onMoveDown, onEdit, onRemove }: {
    part: JourneyPart; index: number; total: number;
    onMoveUp: () => void; onMoveDown: () => void; onEdit: () => void; onRemove: () => void;
}) {
    const hasVideo = part.type === 'video' || part.type === 'both';
    const hasText = part.type === 'text' || part.type === 'both';
    const linkBroken = hasVideo && !part.videoTitle;

    return (
        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-midnight-teal/5 text-xs font-bold text-midnight-teal/60">{part.order}</span>

            <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {hasVideo && part.videoThumbnail ? (
                    <img src={part.videoThumbnail} alt="" className="h-full w-full object-cover" />
                ) : (
                    <div className="grid h-full w-full place-items-center text-midnight-teal/25">{linkBroken ? <ImageOff size={16} /> : hasText ? <FileText size={16} /> : <Video size={16} />}</div>
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-serif text-sm font-semibold text-midnight-teal">{part.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${part.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{part.status}</span>
                    {linkBroken && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-red-500">Link needs attention</span>}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    {hasVideo && <span className="flex items-center gap-1"><Video size={12} /> {part.videoTitle ?? 'No preview'}</span>}
                    {hasText && <span className="flex items-center gap-1"><FileText size={12} /> Written passage</span>}
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
                <IconButton title="Move up" disabled={index === 0} onClick={onMoveUp}><ArrowUp size={14} /></IconButton>
                <IconButton title="Move down" disabled={index === total - 1} onClick={onMoveDown}><ArrowDown size={14} /></IconButton>
                <IconButton title="Edit part" onClick={onEdit}><Pencil size={14} /></IconButton>
                <IconButton title="Remove part" onClick={onRemove} danger><Trash2 size={14} /></IconButton>
            </div>
        </div>
    );
}

function IconButton({ title, onClick, disabled, danger, children }: { title: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
    return (
        <button title={title} aria-label={title} onClick={onClick} disabled={disabled} className={`grid h-8 w-8 place-items-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${danger ? 'text-red-400 hover:bg-red-50 hover:text-red-500' : 'text-midnight-teal/60 hover:bg-midnight-teal/10 hover:text-midnight-teal'}`}>
            {children}
        </button>
    );
}
