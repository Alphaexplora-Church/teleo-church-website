import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { dropdownPanelVariants } from "../../../../../shared/components/Dropdown/dropdown.animations";

export interface ContentJourneyListDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onArchive?: () => void;
  onDelete: () => void;
  className?: string;
  triggerRef?: RefObject<HTMLElement | null>;
  placement?: "bottom" | "top" | "auto";
}

export function ContentJourneyListDropdown({
  isOpen,
  onClose,
  onEdit,
  onArchive,
  onDelete,
  className = "",
  triggerRef,
  placement = "auto",
}: ContentJourneyListDropdownProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(
    null,
  );

  useEffect(() => {
    if (!isOpen || !triggerRef?.current) return;

    const updateCoords = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = onArchive ? 115 : 80;
      const shouldShowAbove =
        placement === "top" ||
        (placement !== "bottom" && spaceBelow < menuHeight + 20);

      const top = shouldShowAbove
        ? rect.top - menuHeight - 4
        : rect.bottom + 6;
      const right = window.innerWidth - rect.right;

      setCoords({ top, right });
    };

    updateCoords();
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);

    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen, triggerRef, placement, onArchive]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        !triggerRef?.current?.contains(target)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef]);

  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          role="menu"
          variants={dropdownPanelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          style={
            triggerRef && coords
              ? {
                  position: "fixed",
                  top: coords.top,
                  right: coords.right,
                  zIndex: 9999,
                }
              : undefined
          }
          className={`${
            triggerRef
              ? "w-36 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1 overflow-hidden"
              : "absolute right-0 top-full mt-2 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 overflow-hidden"
          } ${className}`.trim()}
        >
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              onEdit();
            }}
            className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer select-none block"
          >
            Edit
          </button>
          {onArchive && (
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
                onArchive();
              }}
              className="w-full text-left px-3.5 py-2 text-xs font-medium text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer select-none block"
            >
              Archive
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              onDelete();
            }}
            className="w-full text-left px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer select-none block"
          >
            Delete
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (triggerRef && typeof document !== "undefined") {
    return createPortal(menuContent, document.body);
  }

  return menuContent;
}