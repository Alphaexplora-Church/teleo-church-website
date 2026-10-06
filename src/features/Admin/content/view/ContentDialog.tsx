import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './contentWorkspace.css';

const dialogStack: HTMLElement[] = [];
const focusable = 'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], summary, [tabindex="0"]';

/** Content-only portal: nested dialogs own focus and leave the shared shell alone. */
export function ContentDialog({ children, labelledBy, onClose, busy = false, overlayClass = '', panelClass = '', active = true }: {
    children: ReactNode; labelledBy: string; onClose: () => void; busy?: boolean;
    overlayClass?: string; panelClass?: string; active?: boolean;
}) {
    const panelRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef(onClose);
    const busyRef = useRef(busy);
    useEffect(() => { closeRef.current = onClose; busyRef.current = busy; }, [onClose, busy]);
    useEffect(() => {
        const panel = panelRef.current;
        if (!panel || !active) return;
        const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const covered = dialogStack.at(-1);
        if (covered) covered.inert = true;
        const shell = document.querySelector<HTMLElement>('.admin-shell');
        const shellWasInert = shell?.inert ?? false;
        if (shell) shell.inert = true;
        dialogStack.push(panel);
        const elements = () => Array.from(panel.querySelectorAll<HTMLElement>(focusable)).filter(el => !el.closest('[hidden], [inert]') && el.getClientRects().length > 0);
        const raf = requestAnimationFrame(() => {
            if (dialogStack.at(-1) !== panel) return;
            (panel.querySelector<HTMLElement>('[data-dialog-autofocus]') ?? panel).focus();
        });
        const onKey = (event: KeyboardEvent) => {
            if (dialogStack.at(-1) !== panel || event.defaultPrevented) return;
            if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); if (!busyRef.current) closeRef.current(); }
            if (event.key === 'Tab') {
                const items = elements();
                const first = items[0]; const last = items.at(-1);
                if (!first) { event.preventDefault(); panel.focus(); }
                else if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) { event.preventDefault(); last?.focus(); }
                else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel)) { event.preventDefault(); first.focus(); }
            }
        };
        const contain = (event: FocusEvent) => {
            if (dialogStack.at(-1) === panel && !panel.contains(event.target as Node)) panel.focus();
        };
        document.addEventListener('keydown', onKey);
        document.addEventListener('focusin', contain);
        return () => {
            cancelAnimationFrame(raf);
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('focusin', contain);
            const index = dialogStack.indexOf(panel);
            if (index !== -1) dialogStack.splice(index, 1);
            if (covered?.isConnected) covered.inert = false;
            if (shell && dialogStack.length === 0) shell.inert = shellWasInert;
            if (previous?.isConnected && !previous.closest('[inert]')) previous.focus();
            else if (dialogStack.length === 0) shell?.querySelector<HTMLElement>('.content-workspace')?.focus();
        };
    }, [active]);
    return createPortal(
        <div className={`content-dialog-overlay ${overlayClass}`}>
            <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={labelledBy} aria-busy={busy || undefined} tabIndex={-1} className={`content-dialog ${panelClass}`}>
                {children}
            </div>
        </div>, document.body,
    );
}
