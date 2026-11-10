import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { Button } from "../../../../../../shared/components/Button/Button";

export interface DiscipleshipModalRemoveGroupProps {
  isOpen: boolean;
  groupTitle?: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function DiscipleshipModalRemoveGroup({
  isOpen,
  groupTitle = "",
  onClose,
  onConfirm,
  isLoading = false,
  error = null,
}: DiscipleshipModalRemoveGroupProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 flex w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl text-center"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Warning Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100 mb-4">
              <Trash2 className="h-7 w-7" />
            </div>

            {/* Title & Description */}
            <h3 className="font-sans text-lg font-bold text-slate-900">
              Remove Discipleship Group?
            </h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-slate-800">“{groupTitle}”</span>?
              This group will be archived and removed from active directories.
            </p>

            {/* Error Message */}
            {error && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="md"
                disabled={isLoading}
                onClick={onClose}
                className="flex-1 rounded-xl border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={isLoading}
                onClick={onConfirm}
                className="flex-1 rounded-xl bg-red-600 font-semibold text-white hover:bg-red-700 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isLoading ? "Removing..." : "Remove"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default DiscipleshipModalRemoveGroup;

