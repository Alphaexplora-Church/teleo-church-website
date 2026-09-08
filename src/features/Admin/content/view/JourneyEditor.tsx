// ─── Admin Content — JourneyEditor (View) ───────────────────────────────────
// Covers Phase 1.1 (Edit and Update Series): metadata + the Series builder,
// with Publish gated on at least one Published Part, and the edit-flow rule
// that saving retains the journey's current status unless the Pastor
// explicitly Publishes or Archives. There is no unpublish and no delete —
// the lifecycle is draft to published to archived, and nothing is removed.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Archive, ChevronDown, FileText, GripVertical, ImageOff, Loader2, Pencil, Plus, RotateCcw, Video, X } from 'lucide-react';
import type { Journey, JourneyFormData, JourneyPart, PartFormData } from '../model/adminContent.types';
import { CONTENT_TYPE_OPTIONS, EMPTY_JOURNEY_FORM, canPublishJourney } from '../model/adminContent.types';
import { AdminContentService, buildPart, fetchCategoryCatalog, type JourneyCategoryOption, type VideoPreview } from '../model/adminContent.service';
import { useModalTransition } from '../../../../shared/hooks/useModalTransition';
import { PartModal } from './PartModal';
import { ConfirmArchiveModal } from './ConfirmArchiveModal';
import { fieldClass, iconButtonClass, labelClass, modalOverlayClass, modalPanelClass, statusBadgeClass, toggleChipClass, type IconButtonVariant } from './contentStyles';

interface JourneyEditorProps {
    journey: Journey | null;
    onClose: () => void;
    onSaved: (journey: Journey, isNew: boolean) => void;
    showToast: (msg: string, type?: 'success' | 'error') => void;
}

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
    const [isLoadingParts, setIsLoadingParts] = useState(Boolean(journey));
    const [isSaving, setIsSaving] = useState(false);
    const [partModal, setPartModal] = useState<{ mode: 'add' } | { mode: 'edit'; part: JourneyPart } | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(journey?.thumbnailUrl ?? null);

    // The server's copy of the Parts as loaded. Saving diffs against this to
    // work out which Part statuses changed and whether the order moved.
    const originalParts = useRef<JourneyPart[]>([]);

    const [categoryOptions, setCategoryOptions] = useState<JourneyCategoryOption[]>([]);

    useEffect(() => {
        let cancelled = false;

        fetchCategoryCatalog()
            .then(options => { if (!cancelled) setCategoryOptions(options); })
            .catch(() => { if (!cancelled) showToast('Could not load the category list.', 'error'); });

        return () => { cancelled = true; };
    }, [showToast]);

    useEffect(() => {
        if (!journey) return;

        let cancelled = false;
        setIsLoadingParts(true);

        AdminContentService.fetchJourneyDetail(journey.id)
            .then(detail => {
                if (cancelled) return;
                originalParts.current = detail.parts;
                originalOrder.current = detail.parts.map(part => part.id);
                setParts(detail.parts);
            })
            .catch(() => { if (!cancelled) showToast('Could not load parts for this journey.', 'error'); })
            .finally(() => { if (!cancelled) setIsLoadingParts(false); });

        return () => { cancelled = true; };
    }, [journey, showToast]);

    // ── Drag-and-drop reordering ──────────────────────────────────────────
    // Order changes are applied to local state only — nothing is persisted
    // until the Pastor explicitly saves, matching the rest of this form. A
    // Part's identity (and therefore any Member's completion record against
    // it) is keyed on `id`, never on position, so dragging a row only ever
    // rewrites the `order` field and never touches completion data.
    //
    // This is pointer-driven rather than native HTML5 drag/drop: the row
    // being dragged is pulled out of the list and rendered as a floating
    // clone that tracks the cursor directly, while its old slot collapses
    // to a placeholder and the rows it passes over slide out of the way
    // live (via the FLIP effect below). Native drag/drop can't do this —
    // its "ghost" is a static browser-rendered snapshot that just floats
    // near the cursor without any of the list actually reacting to it.
    const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});
    const dragMeta = useRef<{ id: string; offsetY: number; left: number; width: number; height: number } | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [pointerY, setPointerY] = useState(0);
    const originalOrder = useRef<string[]>((journey?.parts ?? []).map(part => part.id));
    const orderChanged = parts.map(part => part.id).join(',') !== originalOrder.current.join(',');

    // Rows animate into their new slot as they get displaced (FLIP: measure
    // before the reorder, then transition away the delta after React commits).
    const prevTops = useRef<Record<string, number>>({});

    useLayoutEffect(() => {
        const nextTops: Record<string, number> = {};
        parts.forEach(part => {
            const el = itemRefs.current[part.id];
            if (el) nextTops[part.id] = el.getBoundingClientRect().top;
        });

        parts.forEach(part => {
            if (part.id === draggingId) return; // the dragged row is a floating clone, not this slot
            const el = itemRefs.current[part.id];
            const prevTop = prevTops.current[part.id];
            const nextTop = nextTops[part.id];
            if (!el || prevTop === undefined || nextTop === undefined) return;
            const delta = prevTop - nextTop;
            if (Math.abs(delta) < 1) return;

            el.style.transition = 'none';
            el.style.transform = `translateY(${delta}px)`;
            requestAnimationFrame(() => {
                el.style.transition = 'transform 220ms cubic-bezier(0.2, 0, 0.2, 1)';
                el.style.transform = '';
            });
        });

        prevTops.current = nextTops;
    }, [parts, draggingId]);

    const handleGripPointerDown = (e: React.PointerEvent, id: string) => {
        if (e.button !== 0) return;
        const el = itemRefs.current[id];
        if (!el) return;
        const rect = el.getBoundingClientRect();
        dragMeta.current = { id, offsetY: e.clientY - rect.top, left: rect.left, width: rect.width, height: rect.height };
        setDraggingId(id);
        setPointerY(e.clientY);
    };

    useEffect(() => {
        if (!draggingId) return;

        const handleMove = (e: PointerEvent) => {
            setPointerY(e.clientY);
            const meta = dragMeta.current;
            if (!meta) return;
            const draggedCenter = (e.clientY - meta.offsetY) + meta.height / 2;

            setParts(prev => {
                const currentIndex = prev.findIndex(p => p.id === meta.id);
                if (currentIndex === -1) return prev;
                const others = prev.filter(p => p.id !== meta.id);
                let targetIndex = others.length;
                for (let i = 0; i < others.length; i++) {
                    const otherEl = itemRefs.current[others[i].id];
                    if (!otherEl) continue;
                    const rect = otherEl.getBoundingClientRect();
                    if (draggedCenter < rect.top + rect.height / 2) { targetIndex = i; break; }
                }
                if (targetIndex === currentIndex) return prev;
                const next = [...prev];
                const [moved] = next.splice(currentIndex, 1);
                next.splice(targetIndex, 0, moved);
                return next.map((p, i) => ({ ...p, order: i + 1 }));
            });
        };

        const handleUp = () => {
            dragMeta.current = null;
            setDraggingId(null);
        };

        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
        window.addEventListener('pointercancel', handleUp);
        const prevUserSelect = document.body.style.userSelect;
        document.body.style.userSelect = 'none';
        return () => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
            window.removeEventListener('pointercancel', handleUp);
            document.body.style.userSelect = prevUserSelect;
        };
    }, [draggingId]);

    // ── Per-part archive/restore ──────────────────────────────────────────
    // Archiving is staged locally (like everything else in this form) and
    // only takes effect on Save; a confirmation is required either way since
    // it hides a Part from Members while leaving any completion already
    // recorded against it untouched.
    const [archivePartTarget, setArchivePartTarget] = useState<JourneyPart | null>(null);

    const setPartStatus = (id: string, status: JourneyPart['status']) => {
        setParts(prev => prev.map(part => part.id === id ? { ...part, status } : part));
    };

    const handleThumbnailChange = (file: File | null) => {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            showToast('That image is larger than 5MB.', 'error');
            return;
        }
        setThumbnailFile(file);
        setThumbnailPreview(URL.createObjectURL(file));
    };

    const toggleCategory = (category: string) => {
        setForm(prev => ({
            ...prev,
            categories: prev.categories.includes(category)
                ? prev.categories.filter(item => item !== category)
                : [...prev.categories, category],
        }));
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
    const [archiveJourneyOpen, setArchiveJourneyOpen] = useState(false);
    const [isArchivingJourney, setIsArchivingJourney] = useState(false);

    const persist = async (nextStatus?: Journey['status'], options?: { closeOnSave?: boolean }) => {
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
                // Pastor explicitly Publishes or Archives from this screen.
                saved = await AdminContentService.saveJourney(journey.id, form, parts, nextStatus, originalParts.current, thumbnailFile);
                const message = nextStatus === 'published' ? `“${saved.title}” published.`
                    : nextStatus === 'archived' ? `“${saved.title}” archived.`
                    : `“${saved.title}” updated.`;
                showToast(message);
                originalParts.current = saved.parts;
                setThumbnailFile(null);
                originalOrder.current = saved.parts.map(part => part.id);
            } else {
                saved = await AdminContentService.createJourney(form, parts, nextStatus, thumbnailFile);
                showToast(nextStatus === 'published' ? `“${saved.title}” published.` : `“${saved.title}” saved as draft.`);
            }
            onSaved(saved, isNew);
            if (options?.closeOnSave !== false) requestClose();
        } catch (err) {
            // A failed save leaves the server on its old ordering, so put the
            // rows back where they were rather than showing an order that was
            // never persisted. Content and status edits are kept so the
            // Pastor can fix the problem and retry without retyping.
            if (orderChanged) {
                const rank = new Map(originalOrder.current.map((partId, index) => [partId, index]));
                setParts(prev => [...prev]
                    .sort((a, b) => (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER))
                    .map((part, index) => ({ ...part, order: index + 1 })));
            }
            showToast(err instanceof Error ? err.message : 'Failed to save the journey.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleArchiveJourney = async () => {
        setIsArchivingJourney(true);
        await persist('archived');
        setIsArchivingJourney(false);
        setArchiveJourneyOpen(false);
    };

    const handleArchivePart = () => {
        if (!archivePartTarget) return;
        setPartStatus(archivePartTarget.id, 'archived');
        setArchivePartTarget(null);
    };

    return (
        <div className={`z-50 ${modalOverlayClass(visible, !archiveJourneyOpen && !archivePartTarget)}`}>
            <div className={`max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/70 bg-[#f7faf8] shadow-2xl shadow-midnight-teal/30 ${modalPanelClass(visible)}`}>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-midnight-teal/95 px-6 py-5 backdrop-blur-xl">
                    <div>
                        <h2 className="font-serif text-2xl text-soft-linen">{journey ? 'Edit Journey' : 'New Journey'}</h2>
                        {journey && <p className="text-xs font-semibold uppercase tracking-widest text-soft-linen/50">Currently {journey.status}</p>}
                    </div>
                    <button onClick={requestClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full text-soft-linen/60 transition-colors hover:bg-white/10 hover:text-soft-linen"><X size={18} /></button>
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
                            <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} rows={5} placeholder="What is this series about?" className={`${fieldClass} resize-none`} />
                        </div>

                        <div>
                            <label className={labelClass}>Thumbnail <span className="normal-case font-semibold text-midnight-teal/40">(optional)</span></label>
                            <div className="flex items-center gap-4">
                                {thumbnailPreview ? (
                                    <img src={thumbnailPreview} alt="" className="h-20 w-32 shrink-0 rounded-xl object-cover" />
                                ) : (
                                    <div className="grid h-20 w-32 shrink-0 place-items-center rounded-xl bg-midnight-teal/5 text-midnight-teal/30">
                                        <ImageOff size={20} />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={e => handleThumbnailChange(e.target.files?.[0] ?? null)}
                                    className="text-sm text-midnight-teal/70 file:mr-3 file:rounded-lg file:border-0 file:bg-midnight-teal file:px-4 file:py-2 file:text-sm file:font-bold file:text-soft-linen hover:file:bg-deep-teal"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Content Type</label>
                                <div className="relative">
                                    <select
                                        value={form.contentType}
                                        onChange={e => setForm(prev => ({ ...prev, contentType: e.target.value as JourneyFormData['contentType'] }))}
                                        className={`${fieldClass} appearance-none pr-10`}
                                    >
                                        {CONTENT_TYPE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                    </select>
                                    <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-midnight-teal/40" />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Summary <span className="normal-case font-semibold text-midnight-teal/40">(optional)</span></label>
                                <input value={form.summary} onChange={e => setForm(prev => ({ ...prev, summary: e.target.value }))} placeholder="Short teaser for listings" className={fieldClass} />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Categories</label>
                            {categoryOptions.length === 0 ? (
                                <p className="text-xs text-gray-400">Loading categories…</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {categoryOptions.map(option => {
                                        const active = form.categories.includes(option.name);
                                        return (
                                            <button key={option.categoryId} type="button" onClick={() => toggleCategory(option.name)} className={toggleChipClass(active)}>
                                                {option.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
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

                        {isLoadingParts ? (
                            <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-midnight-teal/15 bg-white/60 p-8 text-center">
                                <Loader2 className="h-4 w-4 animate-spin text-midnight-teal/50" />
                                <p className="text-sm font-semibold text-midnight-teal/50">Loading parts…</p>
                            </div>
                        ) : parts.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-midnight-teal/15 bg-white/60 p-8 text-center">
                                <p className="text-sm font-semibold text-midnight-teal/50">No parts yet. Add your first part to build the series.</p>
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {parts.map(part => {
                                    const isBeingDragged = draggingId === part.id;
                                    return (
                                        <li
                                            key={part.id}
                                            ref={el => { itemRefs.current[part.id] = el; }}
                                            className="animate-fade-in-up"
                                        >
                                            {isBeingDragged ? (
                                                <div
                                                    className="rounded-2xl border-2 border-dashed border-harvest-orange/30 bg-harvest-orange/5"
                                                    style={{ height: dragMeta.current?.height }}
                                                />
                                            ) : (
                                                <PartRow
                                                    part={part}
                                                    onGripPointerDown={e => handleGripPointerDown(e, part.id)}
                                                    onEdit={() => setPartModal({ mode: 'edit', part })}
                                                    onArchive={() => setArchivePartTarget(part)}
                                                    onRestore={() => setPartStatus(part.id, 'draft')}
                                                />
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        {draggingId && dragMeta.current && (() => {
                            const meta = dragMeta.current!;
                            const draggedPart = parts.find(p => p.id === draggingId);
                            if (!draggedPart) return null;
                            return createPortal(
                                <div
                                    className="pointer-events-none fixed z-[70]"
                                    style={{ top: pointerY - meta.offsetY, left: meta.left, width: meta.width }}
                                >
                                    <PartRow
                                        part={draggedPart}
                                        isFloating
                                        onGripPointerDown={() => {}}
                                        onEdit={() => {}}
                                        onArchive={() => {}}
                                        onRestore={() => {}}
                                    />
                                </div>,
                                document.body,
                            );
                        })()}

                        {orderChanged && (
                            <p className="text-xs font-semibold text-harvest-orange">Part order changed — save to apply. Members' existing completion progress is unaffected either way.</p>
                        )}

                        <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold ${isPublishable ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {isPublishable ? 'Ready to publish — at least one Part is Published.' : 'Publish is locked until at least one Part is set to Published.'}
                        </div>
                    </section>
                </div>

                <div className="sticky bottom-0 flex flex-col-reverse flex-wrap gap-3 border-t border-midnight-teal/10 bg-white/85 px-6 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-end">
                    {journey && journey.status !== 'archived' && (
                        <button
                            onClick={() => setArchiveJourneyOpen(true)}
                            disabled={isSaving}
                            className="flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-amber-700 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50 sm:mr-auto"
                        >
                            <Archive size={14} /> Archive Journey
                        </button>
                    )}
                    <button onClick={requestClose} disabled={isSaving} className="rounded-xl px-5 py-2.5 text-sm font-bold text-midnight-teal/55 transition-colors hover:bg-midnight-teal/5 hover:text-midnight-teal disabled:cursor-not-allowed disabled:opacity-50">Cancel</button>
                    {journey?.status !== 'published' && (
                        <button onClick={() => void persist(undefined)} disabled={isSaving} className="flex items-center justify-center gap-2 rounded-xl border border-midnight-teal/15 bg-white px-5 py-2.5 text-sm font-bold text-midnight-teal transition-colors hover:bg-midnight-teal/5 disabled:opacity-50">
                            {isSaving && <Loader2 size={14} className="animate-spin" />} {journey ? 'Save Changes' : 'Save as Draft'}
                        </button>
                    )}
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

            <ConfirmArchiveModal
                open={archiveJourneyOpen}
                itemKind="Journey"
                itemTitle={form.title || 'this journey'}
                isArchiving={isArchivingJourney}
                onCancel={() => setArchiveJourneyOpen(false)}
                onConfirm={() => void handleArchiveJourney()}
            />

            <ConfirmArchiveModal
                open={Boolean(archivePartTarget)}
                itemKind="Part"
                itemTitle={archivePartTarget?.title ?? ''}
                onCancel={() => setArchivePartTarget(null)}
                onConfirm={handleArchivePart}
            />
        </div>
    );
}

function PartRow({ part, isFloating = false, onGripPointerDown, onEdit, onArchive, onRestore }: {
    part: JourneyPart; isFloating?: boolean;
    onGripPointerDown: (e: React.PointerEvent) => void;
    onEdit: () => void;
    onArchive: () => void; onRestore: () => void;
}) {
    const hasVideo = part.type === 'video' || part.type === 'both';
    const hasText = part.type === 'text' || part.type === 'both';
    const linkBroken = hasVideo && !part.videoTitle;
    const isArchived = part.status === 'archived';

    return (
        <div
            style={isFloating ? { transform: 'scale(1.03) rotate(-1deg)' } : undefined}
            className={`relative flex items-center gap-2 rounded-2xl border bg-white p-3 transition-[box-shadow,border-color] duration-150 ${
                isFloating ? 'border-harvest-orange bg-white shadow-2xl shadow-midnight-teal/25 ring-2 ring-harvest-orange/40' : 'border-gray-100 shadow-sm hover:shadow-md'
            } ${isArchived ? 'opacity-60' : ''}`}
        >
            <span
                title="Drag to reorder"
                onPointerDown={onGripPointerDown}
                style={{ touchAction: 'none' }}
                className="grid h-8 w-6 shrink-0 cursor-grab place-items-center text-midnight-teal/25 hover:text-midnight-teal/50 active:cursor-grabbing"
            >
                <GripVertical size={16} />
            </span>

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
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${statusBadgeClass(part.status)}`}>{part.status}</span>
                    {linkBroken && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-red-500">Link needs attention</span>}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    {hasVideo && <span className="flex items-center gap-1"><Video size={12} /> {part.videoTitle ?? 'No preview'}</span>}
                    {hasText && <span className="flex items-center gap-1"><FileText size={12} /> Written passage</span>}
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
                <IconButton title="Edit part" onClick={onEdit}><Pencil size={14} /></IconButton>
                {isArchived ? (
                    <IconButton title="Restore part" onClick={onRestore} variant="warn"><RotateCcw size={14} /></IconButton>
                ) : (
                    <IconButton title="Archive part" onClick={onArchive} variant="warn"><Archive size={14} /></IconButton>
                )}
            </div>
        </div>
    );
}

function IconButton({ title, onClick, disabled, variant = 'default', children }: { title: string; onClick: () => void; disabled?: boolean; variant?: IconButtonVariant; children: React.ReactNode }) {
    return (
        <button title={title} aria-label={title} onClick={onClick} disabled={disabled} className={`grid h-8 w-8 place-items-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${iconButtonClass(variant)}`}>
            {children}
        </button>
    );
}
