import { useEffect, useRef, useState } from 'react';

/**
 * For modals that are mounted/unmounted by a parent (e.g. `{isOpen && <Modal />}`).
 * Plays a fade+scale-in on mount, and — via `requestClose` — a matching
 * fade+scale-out before actually calling the parent's `onClose`, so the
 * dialog never just vanishes mid-frame.
 *
 * Usage:
 *   const { visible, requestClose } = useModalTransition(onClose);
 *   <div className={visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}>
 *   <button onClick={requestClose}>Cancel</button>
 */
export function useModalTransition(onClose: () => void, duration = 180) {
    const [visible, setVisible] = useState(false);
    const closingRef = useRef(false);

    useEffect(() => {
        // Deferred to the next frame so the initial (hidden) state actually
        // paints before we animate away from it.
        const raf = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    const requestClose = () => {
        if (closingRef.current) return;
        closingRef.current = true;
        setVisible(false);
        window.setTimeout(onClose, duration);
    };

    return { visible, requestClose };
}

/**
 * For modals that stay mounted and are shown/hidden purely via an `open`
 * boolean prop (e.g. confirmation dialogs). Keeps the dialog rendered for
 * `duration`ms after `open` flips to false so the exit transition can play
 * out instead of the dialog disappearing instantly.
 */
export function useControlledModalTransition(open: boolean, duration = 180) {
    const [shouldRender, setShouldRender] = useState(open);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (open) {
            // Reveal-after-mount pattern (see useModalTransition above) —
            // not state synchronization, so intentionally opting out of the rule.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShouldRender(true);
            const raf = requestAnimationFrame(() => setVisible(true));
            return () => cancelAnimationFrame(raf);
        }
        setVisible(false);
        const timeout = window.setTimeout(() => setShouldRender(false), duration);
        return () => window.clearTimeout(timeout);
    }, [open, duration]);

    return { shouldRender, visible };
}
