// ─── Admin Content — ConfirmArchiveModal (View) ─────────────────────────────
// Shared confirmation dialog for archiving either a whole Journey (from the
// list view or the editor) or a single Part (from the Series builder).
// Always names the concrete downstream effect on Members before letting the
// action through, per the "archiving ... with confirmation prompts,
// reflecting downstream effects on Member completion totals/visibility" spec.
import { Archive, Loader2 } from 'lucide-react';
import { useControlledModalTransition } from '../../../../shared/hooks/useModalTransition';
import { modalOverlayClass, modalPanelClass } from './contentStyles';

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
        <div className={`z-[70] ${modalOverlayClass(visible)}`}>
            <div className={`mx-4 w-full max-w-sm rounded-2xl bg-white admin-solid-surface p-8 text-center shadow-2xl ${modalPanelClass(visible)}`}>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                    <Archive className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="mb-2 font-serif text-xl text-midnight-teal">Archive this {itemKind}?</h3>
                <p className="mb-3 text-sm text-gray-500">
                    “<span className="font-semibold text-gray-700">{itemTitle}</span>” will be hidden from Members{isJourney ? ', including every Part in it,' : ''} but not deleted.
                </p>
                <p className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-left text-xs font-semibold leading-relaxed text-amber-800">
                    {isJourney
                        ? 'Members who already started this journey keep their existing completion progress — it just drops off active listings and can no longer be continued until restored.'
                        : 'Members who already completed this part keep that record on their completion totals — it just disappears from the series until restored.'}
                </p>
                <div className="flex justify-center gap-3">
                    <button onClick={onCancel} disabled={isArchiving} className="rounded-lg px-5 py-2 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50">Cancel</button>
                    <button
                        onClick={onConfirm}
                        disabled={isArchiving}
                        className="flex min-w-[6.5rem] items-center justify-center gap-2 rounded-lg bg-amber-600 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isArchiving ? <Loader2 size={16} className="animate-spin" /> : 'Archive'}
                    </button>
                </div>
            </div>
        </div>
    );
}
