// ─── Admin Content — PartReorderPanel (View) ────────────────────────────────
// Drag-and-drop reorder UI for Parts within a Series/Journey. Ships with
// dummy data so it's fully interactive on its own — pass real `parts` /
// `onSave` when wiring into JourneyEditor.
import { useLayoutEffect, useRef, useState } from 'react';
import { FileText, GripVertical, Loader2, Video } from 'lucide-react';
import type { JourneyPart } from '../model/adminContent.types';

export interface PartReorderPayloadItem { partId: string; position: number }

interface PartReorderPanelProps {
    parts?: JourneyPart[];
    journeyTitle?: string;
    /** Called with the new order once confirmed; defaults to a mocked ~600ms API call. */
    onSave?: (payload: PartReorderPayloadItem[]) => Promise<void>;
}

const DUMMY_PARTS: JourneyPart[] = [
    { id: 'p1', order: 1, title: 'Rooted in Grace', type: 'video', status: 'published', videoTitle: 'Session 1', videoThumbnail: null },
    { id: 'p2', order: 2, title: 'Walking in the Word', type: 'both', status: 'published', videoTitle: 'Session 2', videoThumbnail: null, textContent: '...' },
    { id: 'p3', order: 3, title: 'Community & Belonging', type: 'text', status: 'draft', textContent: '...' },
    { id: 'p4', order: 4, title: 'Bearing Fruit', type: 'video', status: 'draft', videoTitle: null, videoThumbnail: null },
    { id: 'p5', order: 5, title: 'A Steadfast Hope', type: 'video', status: 'published', videoTitle: 'Session 5', videoThumbnail: null },
];

/** Sample payload shape sent on save: `[{ partId, position }]`, 1-based. */
const mockSave = (payload: PartReorderPayloadItem[]) =>
    new Promise<void>((resolve, reject) => {
        window.setTimeout(() => (Math.random() < 0.9 ? resolve() : reject(new Error('network'))), 600);
    });

export function PartReorderPanel({ parts: initialParts = DUMMY_PARTS, journeyTitle = 'Rooted: A Journey Through Colossians', onSave = mockSave }: PartReorderPanelProps) {
    const [original, setOriginal] = useState(initialParts);
    const [parts, setParts] = useState(initialParts);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [overIndex, setOverIndex] = useState<number | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    // FLIP animation: whenever the order changes, the rows that shifted
    // slide smoothly into their new spot instead of just snapping there.
    const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});
    const prevTops = useRef<Record<string, number>>({});

    useLayoutEffect(() => {
        const nextTops: Record<string, number> = {};
        parts.forEach(part => {
            const el = itemRefs.current[part.id];
            if (el) nextTops[part.id] = el.getBoundingClientRect().top;
        });

        parts.forEach((part, i) => {
            if (i === dragIndex) return; // the dragged row is handled by its own drag styling
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
    }, [parts, dragIndex]);

    const isDirty = parts.some((part, i) => part.id !== original[i].id);
    const payload: PartReorderPayloadItem[] = parts.map((part, i) => ({ partId: part.id, position: i + 1 }));

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        window.setTimeout(() => setToast(null), 3000);
    };

    const handleDragEnter = (index: number) => {
        if (dragIndex === null || dragIndex === index) return;
        setParts(prev => {
            const next = [...prev];
            const [moved] = next.splice(dragIndex, 1);
            next.splice(index, 0, moved);
            return next;
        });
        setDragIndex(index);
        setOverIndex(index);
    };

    const reset = () => setParts(original);

    const confirmSave = async () => {
        setIsSaving(true);
        try {
            await onSave(payload);
            setOriginal(parts);
            setShowConfirm(false);
            showToast('Part order updated.');
        } catch {
            showToast('Failed to save new order. Try again.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl rounded-3xl border border-white/70 bg-[#f7faf8] p-6 shadow-xl shadow-midnight-teal/10 sm:p-7">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h3 className="font-serif text-lg text-midnight-teal">Reorder Parts</h3>
                    <p className="text-xs text-gray-400">{journeyTitle} · drag a row to move it</p>
                </div>
                {isDirty && <span className="rounded-full bg-harvest-orange/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-harvest-orange">Unsaved changes</span>}
            </div>

            <ul className="space-y-2">
                {parts.map((part, index) => {
                    const hasVideo = part.type === 'video' || part.type === 'both';
                    const hasText = part.type === 'text' || part.type === 'both';
                    const isDragging = dragIndex === index;
                    return (
                        <li
                            key={part.id}
                            ref={el => { itemRefs.current[part.id] = el; }}
                            draggable
                            onDragStart={() => setDragIndex(index)}
                            onDragEnter={() => handleDragEnter(index)}
                            onDragOver={e => e.preventDefault()}
                            onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
                            style={isDragging ? { transform: 'scale(1.03) rotate(-1deg)' } : undefined}
                            className={`relative flex items-center gap-3 rounded-2xl border bg-white p-3 transition-[box-shadow,border-color,background-color] duration-150 ${
                                isDragging
                                    ? 'z-10 border-harvest-orange bg-white shadow-2xl shadow-midnight-teal/25 ring-2 ring-harvest-orange/40'
                                    : overIndex === index
                                        ? 'border-harvest-orange/30 shadow-sm ring-2 ring-harvest-orange/15'
                                        : 'border-gray-100 shadow-sm'
                            }`}
                        >
                            <span className="cursor-grab text-midnight-teal/30 active:cursor-grabbing"><GripVertical size={16} /></span>
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-midnight-teal/5 text-xs font-bold text-midnight-teal/60">{index + 1}</span>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate font-serif text-sm font-semibold text-midnight-teal">{part.title}</p>
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${part.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{part.status}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    {hasVideo && <span className="flex items-center gap-1"><Video size={12} /> Video</span>}
                                    {hasText && <span className="flex items-center gap-1"><FileText size={12} /> Text</span>}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>

            <div className="mt-6 flex justify-end gap-3 border-t border-midnight-teal/10 pt-4">
                <button onClick={reset} disabled={!isDirty || isSaving} className="rounded-xl px-5 py-2.5 text-sm font-bold text-midnight-teal/55 transition-colors hover:bg-midnight-teal/5 hover:text-midnight-teal disabled:cursor-not-allowed disabled:opacity-40">
                    Cancel / Reset
                </button>
                <button onClick={() => setShowConfirm(true)} disabled={!isDirty || isSaving} className="flex items-center justify-center gap-2 rounded-xl bg-midnight-teal px-5 py-2.5 text-sm font-bold text-soft-linen shadow-lg shadow-midnight-teal/15 transition-all hover:-translate-y-0.5 hover:bg-deep-teal disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:hover:translate-y-0">
                    Save Order
                </button>
            </div>

            {toast && (
                <div className={`fixed bottom-6 right-6 z-[60] rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
                    {toast.msg}
                </div>
            )}

            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-teal/45 p-4 backdrop-blur-md">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
                        <h3 className="mb-2 font-serif text-xl text-midnight-teal">Save new order?</h3>
                        <p className="mb-6 text-sm text-gray-500">Reordering parts will update the sequence for all members. Existing completion progress for members will remain intact.</p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setShowConfirm(false)} disabled={isSaving} className="rounded-lg px-5 py-2 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50">Cancel</button>
                            <button onClick={() => void confirmSave()} disabled={isSaving} className="flex min-w-[6rem] items-center justify-center gap-2 rounded-lg bg-harvest-orange px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-harvest-orange/90 disabled:opacity-70">
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
