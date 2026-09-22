// ─── Admin Content — shared view-layer style tokens ─────────────────────────
// Single source of truth for the classNames repeated across AdminContentView,
// JourneyEditor, PartModal, and the confirm dialogs. Keeping these here (once)
// instead of copy-pasted per-file means the whole Content section moves
// together instead of drifting: change a color or radius once, everywhere
// that role appears updates with it.
import type { JourneyStatus, PartStatus } from '../model/adminContent.types';

// ── Form fields (inputs / textareas / selects) ───────────────────────────
export const labelClass = 'mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-midnight-teal/75';
export const fieldClass = 'w-full rounded-xl border border-midnight-teal/10 bg-white/90 px-4 py-3 text-sm text-midnight-teal shadow-sm outline-none transition-all placeholder:text-midnight-teal/30 focus:border-harvest-orange/50 focus:ring-4 focus:ring-harvest-orange/10';

// ── Status badges ─────────────────────────────────────────────────────────
// Journey status and Part status share the same three states and the same
// meaning (draft / published / archived), so they share one color map —
// previously these were two near-identical objects that had quietly drifted
// (one used text-gray-500, the other text-gray-600).
const STATUS_BADGE_CLASSES: Record<JourneyStatus | PartStatus, string> = {
    draft: 'bg-gray-100 text-gray-600',
    published: 'bg-emerald-50 text-emerald-700',
    archived: 'bg-amber-50 text-amber-700',
};
export const statusBadgeClass = (status: JourneyStatus | PartStatus) => STATUS_BADGE_CLASSES[status];

// ── Multi-select toggle chips (Categories, Status filter, etc.) ──────────
// One active/inactive treatment for every "tap to toggle on/off" chip group
// in this section, so Categories and Status filters read as the same kind
// of control. Harvest-orange is reserved for primary CTAs and attention
// callouts (Publish, "unsaved changes"), not for everyday selection state.
export const toggleChipClass = (active: boolean) =>
    `rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
        active
            ? 'border border-midnight-teal bg-midnight-teal text-soft-linen'
            : 'border border-midnight-teal/15 bg-white text-midnight-teal/60 hover:border-midnight-teal/30 hover:text-midnight-teal'
    }`;

// ── Single-select segmented buttons (Part content type, etc.) ────────────
// Square-ish and filled-teal-when-active, distinct from the pill-shaped
// multi-select chips above, so the two interaction models stay visually
// distinguishable from one another everywhere they appear.
export const segmentedButtonClass = (active: boolean) =>
    `rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
        active
            ? 'bg-midnight-teal text-soft-linen shadow'
            : 'border border-midnight-teal/10 bg-white text-midnight-teal/60 hover:text-midnight-teal'
    }`;

// ── Icon-only row actions (Edit / Archive / Restore / Delete) ────────────
// A three-tier semantic color system so the same action always reads the
// same way regardless of which row it's attached to: neutral teal for safe,
// reversible actions; amber for cautionary archive/restore (matching the
// amber used in ConfirmArchiveModal and the "Archive Journey" button); red
// for permanent deletion.
export type IconButtonVariant = 'default' | 'warn' | 'danger';
export const iconButtonClass = (variant: IconButtonVariant = 'default') => {
    switch (variant) {
        case 'danger': return 'text-red-400 hover:bg-red-50 hover:text-red-500';
        case 'warn': return 'text-amber-600/70 hover:bg-amber-50 hover:text-amber-700';
        default: return 'text-midnight-teal/60 hover:bg-midnight-teal/10 hover:text-midnight-teal';
    }
};

// ── Modal chrome (overlay + panel) ────────────────────────────────────────
// Every dialog in this section — the two full editors and the two confirm
// prompts — shares one overlay treatment so opening any of them feels like
// the same surface, just sized differently for its content.
//
// `dimmed` defaults to true (paint the tinted backdrop). Pass `false` when
// this modal is rendered *behind* another modal that already has its own
// overlay open (e.g. JourneyEditor while its Archive-confirm is open) —
// otherwise the two semi-transparent layers stack and that popup ends up
// visibly darker than every other one.
export const modalOverlayClass = (visible: boolean, dimmed: boolean = true) =>
    `fixed inset-0 flex items-center justify-center p-4 backdrop-blur-md transition-opacity duration-200 ${dimmed ? 'bg-midnight-teal/45' : 'bg-transparent'} ${visible ? 'opacity-100' : 'opacity-0'}`;

export const modalPanelClass = (visible: boolean) =>
    `transition-all duration-200 ease-out ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`;
