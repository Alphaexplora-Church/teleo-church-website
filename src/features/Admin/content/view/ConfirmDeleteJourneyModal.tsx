// ─── Admin Content — ConfirmDeleteJourneyModal (View) ───────────────────────
import { Loader2 } from 'lucide-react';
import { useControlledModalTransition } from '../../../../shared/hooks/useModalTransition';

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
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`mx-4 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl transition-all duration-200 ease-out ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                    <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </div>
                <h3 className="mb-2 font-serif text-xl text-midnight-teal">Delete Journey?</h3>
                <p className="mb-6 text-sm text-gray-500">
                    “<span className="font-semibold text-gray-700">{journeyTitle}</span>” and all of its parts will be permanently removed.
                </p>
                <div className="flex justify-center gap-3">
                    <button onClick={onCancel} disabled={isDeleting} className="rounded-lg px-5 py-2 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50">Cancel</button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex min-w-[5.5rem] items-center justify-center gap-2 rounded-lg bg-red-500 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}
