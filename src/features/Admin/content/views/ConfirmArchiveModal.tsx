// ─── Admin Content — ConfirmArchiveModal (View) ─────────────────────────────
// Shared confirmation dialog for archiving either a whole Journey (from the
// list view or the editor) or a single Part (from the Series builder).
// Always names the concrete downstream effect on Members before letting the
// action through, per the "archiving ... with confirmation prompts,
// reflecting downstream effects on Member completion totals/visibility" spec.
import { Archive, Loader2 } from 'lucide-react';
import { useControlledModalTransition } from '../../../../shared/viewmodels/useModalTransition';

interface ConfirmArchiveModalProps {
    open: boolean;
    /** e.g. "Journey" or "Part" — used in the heading and body copy. */
    itemKind: 'Journey' | 'Part';
    itemTitle: string;
    isArchiving?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export function ConfirmArchiveModal({ open, itemKind, itemTitle, isArchiving = false, onCancel, onConfirm }: ConfirmArchiveModalProps) {
    const { shouldRender, visible } = useControlledModalTransition(open);
    if (!shouldRender) return null;

    const isJourney = itemKind === 'Journey';

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}>
            <div className={`bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 flex flex-col gap-4 relative z-10 transition-all duration-200 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                    <Archive className="h-7 w-7 text-amber-600" />
                </div>
                <div className="text-center">
                    <h3 className="mb-2 text-xl font-bold text-slate-900">Archive this {itemKind}?</h3>
                    <p className="mb-3 text-sm text-slate-500">
                        “<span className="font-semibold text-slate-700">{itemTitle}</span>” will be hidden from Members{isJourney ? ', including every Part in it,' : ''} but not deleted.
                    </p>
                </div>
                <p className="rounded-xl bg-amber-50 px-4 py-3 text-left text-xs font-semibold leading-relaxed text-amber-800 border border-amber-200/60">
                    {isJourney
                        ? 'Members who already started this journey keep their existing completion progress — it just drops off active listings and can no longer be continued until restored.'
                        : 'Members who already completed this part keep that record on their completion totals — it just disappears from the series until restored.'}
                </p>
                <div className="flex justify-end gap-3 mt-2">
                    <button onClick={onCancel} disabled={isArchiving} className="rounded-xl px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer">Cancel</button>
                    <button
                        onClick={onConfirm}
                        disabled={isArchiving}
                        className="flex min-w-[6.5rem] items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-5 py-2 text-sm font-medium text-white shadow-xs transition-colors disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                    >
                        {isArchiving ? <Loader2 size={16} className="animate-spin" /> : 'Archive'}
                    </button>
                </div>
            </div>
        </div>
    );
}
