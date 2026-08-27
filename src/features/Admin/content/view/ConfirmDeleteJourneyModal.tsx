// ─── Admin Content — ConfirmDeleteJourneyModal (View) ───────────────────────
// Mirrors ConfirmArchiveModal's chrome (overlay, icon badge, layout, button
// sizing) so the two destructive-ish confirmations in this section read as
// one family of dialog rather than two different components that happen to
// look similar. Delete is permanent, so it gets the same boxed detail copy
// Archive uses to spell out the downstream effect before letting it through.
import { Loader2, Trash2 } from 'lucide-react';
import { useControlledModalTransition } from '../../../../shared/hooks/useModalTransition';
import { modalOverlayClass, modalPanelClass } from './contentStyles';

interface ConfirmDeleteJourneyModalProps {
    open: boolean;
    journeyTitle: string;
    isDeleting?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export function ConfirmDeleteJourneyModal({ open, journeyTitle, isDeleting = false, onCancel, onConfirm }: ConfirmDeleteJourneyModalProps) {
    const { shouldRender, visible } = useControlledModalTransition(open);
    if (!shouldRender) return null;

    return (
        <div className={`z-[70] ${modalOverlayClass(visible)}`}>
            <div className={`mx-4 w-full max-w-sm rounded-2xl bg-white admin-solid-surface p-8 text-center shadow-2xl ${modalPanelClass(visible)}`}>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                    <Trash2 className="h-7 w-7 text-red-500" />
                </div>
                <h3 className="mb-2 font-serif text-xl text-midnight-teal">Delete this Journey?</h3>
                <p className="mb-3 text-sm text-gray-500">
                    “<span className="font-semibold text-gray-700">{journeyTitle}</span>” and all of its parts will be permanently removed. This can't be undone.
                </p>
                <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-left text-xs font-semibold leading-relaxed text-red-700">
                    Unlike archiving, deleting erases this journey and every part in it for good — including any Member completion history recorded against it. Archive instead if you just want to hide it from Members.
                </p>
                <div className="flex justify-center gap-3">
                    <button onClick={onCancel} disabled={isDeleting} className="rounded-lg px-5 py-2 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50">Cancel</button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex min-w-[6.5rem] items-center justify-center gap-2 rounded-lg bg-red-500 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}
