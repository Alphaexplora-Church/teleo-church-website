import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "../../../../../shared/components/Button/Button";
import type { LeaderFilterOption } from "../../models/types/groupsScheduleDirectory.types";

export interface DiscipleshipNewGroupFormData {
  name: string;
  maxCapacity: number;
  disciplerId: string;
  disciplerName: string;
  disciplerImageUrl?: string;
}

export interface DiscipleshipModalNewGroupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: DiscipleshipNewGroupFormData) => void;
  availableLeaders?: readonly LeaderFilterOption[];
  initialData?: Partial<DiscipleshipNewGroupFormData>;
  isLoading?: boolean;
}

function DiscipleshipNewGroupModalContent({
  onClose,
  onSubmit,
  availableLeaders = [],
  initialData,
  isLoading = false,
}: Omit<DiscipleshipModalNewGroupProps, "isOpen">) {
  const leaders = availableLeaders;

  // Form State initialized fresh on mount

  const [name, setName] = useState(initialData?.name ?? "");
  const [maxCapacity, setMaxCapacity] = useState<number>(initialData?.maxCapacity ?? 0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDiscipler, setSelectedDiscipler] = useState<LeaderFilterOption | null>(() => {
    if (initialData?.disciplerId || initialData?.disciplerName) {
      return (
        leaders.find(
          (l) => l.id === initialData?.disciplerId || l.name === initialData?.disciplerName,
        ) ?? null
      );
    }
    return null;
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Close on Escape key (closes dropdown first if open, else closes modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isDropdownOpen) {
          setIsDropdownOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDropdownOpen, onClose]);

  // Prevent background scrolling on mobile while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit?.({
      name: name.trim(),
      maxCapacity,
      disciplerId: selectedDiscipler?.id ?? "",
      disciplerName: selectedDiscipler?.name ?? "",
      disciplerImageUrl: selectedDiscipler?.imageUrl,
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop Blur Overlay */}
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-midnight-teal/40 backdrop-blur-xs"
      />

      {/* Modal Container */}
      <motion.div
        key="modal-panel"
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex w-full max-w-md flex-col overflow-visible rounded-3xl border border-slate-100 bg-white p-5 shadow-2xl shadow-midnight-teal/15 sm:p-7"
      >
        {/* Header: Title, Subtitle & Close Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 sm:space-y-1">
            <h2 className="font-sans text-lg font-bold tracking-tight text-midnight-teal sm:text-xl">
              Create New Discipleship Group
            </h2>
            <p className="text-xs text-slate-500">
              Set up cohort details and assign an active discipler
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-midnight-teal focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Field 1: Group Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Upper Room Fellowship"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-midnight-teal shadow-2xs transition-all placeholder:text-slate-400 focus:border-midnight-teal/40 focus:outline-none focus:ring-2 focus:ring-midnight-teal/10 sm:text-sm"
            />
          </div>

          {/* Field 2: Max Capacity (Seats) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Max Capacity (Seats)
            </label>
            <input
              type="number"
              min={0}
              required
              value={maxCapacity}
              onChange={(e) =>
                setMaxCapacity(Math.max(0, parseInt(e.target.value, 10) || 0))
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-midnight-teal shadow-2xs transition-all placeholder:text-slate-400 focus:border-midnight-teal/40 focus:outline-none focus:ring-2 focus:ring-midnight-teal/10 sm:text-sm"
            />
          </div>

          {/* Field 3: Assigned Discipler Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Assigned Discipler <span className="text-red-500">*</span>
            </label>

            {/* Dropdown trigger container as relative anchor */}
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                className="flex h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-left text-base text-midnight-teal shadow-2xs transition-all hover:border-slate-300 focus:border-midnight-teal/40 focus:outline-none focus:ring-2 focus:ring-midnight-teal/10 sm:text-sm"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  {selectedDiscipler ? (
                    <>
                      {/* Grey Circle Placeholder for Lead */}
                      <div
                        className="h-7 w-7 shrink-0 rounded-full bg-slate-300 ring-1 ring-slate-200"
                        aria-hidden="true"
                      />

                      <span className="truncate font-medium text-midnight-teal">
                        {selectedDiscipler.name}
                      </span>
                    </>
                  ) : (
                    <span className="truncate font-normal text-slate-400">
                      Select lead
                    </span>
                  )}
                </div>

                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Floating Overlay Menu List */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-56 overflow-y-auto rounded-xl border border-gray-100 bg-white p-1 shadow-xl"
                  >
                    <ul className="m-0 flex flex-col gap-0.5 p-0 list-none">
                      {leaders.map((leader) => {
                        const isSelected = selectedDiscipler?.id === leader.id;
                        return (
                          <li key={leader.id} className="list-none">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDiscipler(leader);
                                setIsDropdownOpen(false);
                              }}
                              className={`flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                                isSelected
                                  ? "bg-midnight-teal/5 font-semibold text-midnight-teal"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex min-w-0 items-center gap-2.5">
                                {/* Grey Circle Placeholder for Lead */}
                                <div
                                  className="h-7 w-7 shrink-0 rounded-full bg-slate-300 ring-1 ring-slate-200"
                                  aria-hidden="true"
                                />

                                <span className="truncate">{leader.name}</span>
                              </div>

                              {isSelected && (
                                <Check className="h-4 w-4 shrink-0 text-midnight-teal" />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Modal Footer / Actions */}
          <div className="mt-7 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 sm:flex-initial sm:w-auto"
            >
              Cancel
            </button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!name.trim() || isLoading}
              className="flex-1 rounded-xl font-semibold !text-white shadow-xs transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-initial sm:w-auto"
            >
              {isLoading ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function DiscipleshipModalNewGroup(props: DiscipleshipModalNewGroupProps) {
  return (
    <AnimatePresence>
      {props.isOpen && (
        <DiscipleshipNewGroupModalContent key="new-group-modal-content" {...props} />
      )}
    </AnimatePresence>
  );
}

export default DiscipleshipModalNewGroup;
