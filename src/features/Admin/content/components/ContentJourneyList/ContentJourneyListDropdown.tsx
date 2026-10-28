import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { dropdownPanelVariants } from "../../../../../shared/components/Dropdown/dropdown.animations";

export interface ContentJourneyListDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
  className?: string;
}

export function ContentJourneyListDropdown({
  isOpen,
  onClose,
  onEdit,
  onArchive,
  onDelete,
  className = "",
}: ContentJourneyListDropdownProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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
  }, [isOpen, onClose]);

  return (
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
          className={`absolute right-0 top-full mt-2 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 overflow-hidden ${className}`.trim()}
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
}