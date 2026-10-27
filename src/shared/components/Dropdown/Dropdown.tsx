import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import {
  dropdownItemVariants,
  dropdownPanelVariants,
} from "./dropdown.animations";

export interface DropdownOption<T = string> {
  id: T;
  label: ReactNode;
  icon?: ReactNode;
  checked?: boolean;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

export interface DropdownProps<T = string> {
  trigger: ReactNode | ((isOpen: boolean) => ReactNode);
  items?: readonly DropdownOption<T>[] | DropdownOption<T>[];
  children?: ReactNode;
  align?: "left" | "right";
  placement?: "bottom" | "top";
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnSelect?: boolean;
  width?: string;
  menuClassName?: string;
  className?: string;
}

export interface DropdownItemProps {
  children: ReactNode;
  icon?: ReactNode;
  checked?: boolean;
  disabled?: boolean;
  danger?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

export function DropdownHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`px-3 py-1.5 text-[11px] font-bold tracking-wider text-midnight-teal/50 uppercase select-none ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export function DropdownDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`my-1.5 border-t border-midnight-teal/10 ${className}`} />
  );
}

export function DropdownItem({
  children,
  icon,
  checked,
  disabled = false,
  danger = false,
  onClick,
  className = "",
}: DropdownItemProps) {
  return (
    <motion.li variants={dropdownItemVariants} className="list-none">
      <button
        type="button"
        role="menuitem"
        disabled={disabled}
        onClick={onClick}
        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors duration-150 select-none ${disabled
            ? "cursor-not-allowed opacity-40"
            : danger
              ? "cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700"
              : "cursor-pointer text-midnight-teal hover:bg-midnight-teal/5"
          } ${className}`.trim()}
      >
        {typeof checked === "boolean" && (
          <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-colors ${checked
                ? "border-midnight-teal bg-midnight-teal text-white"
                : "border-slate-300 bg-white"
              }`}
          >
            {checked && <Check className="h-3 w-3 stroke-[3]" />}
          </span>
        )}

        {icon && <span className="shrink-0 text-midnight-teal/70">{icon}</span>}
        <span className="flex-1 truncate">{children}</span>
      </button>
    </motion.li>
  );
}

export function Dropdown<T = string>({
  trigger,
  items,
  children,
  align = "left",
  placement = "bottom",
  isOpen: controlledIsOpen,
  onOpenChange,
  closeOnSelect,
  width = "min-w-48",
  menuClassName = "",
  className = "",
}: DropdownProps<T>) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = typeof controlledIsOpen === "boolean";
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const containerRef = useRef<HTMLDivElement>(null);

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) setInternalIsOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  const toggleOpen = useCallback(() => {
    setOpen(!isOpen);
  }, [isOpen, setOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, setOpen]);

  const alignmentClass = align === "right" ? "right-0" : "left-0";
  const placementClass =
    placement === "top" ? "bottom-full mb-2" : "top-full mt-2";

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${isOpen ? "z-50" : ""} ${className}`.trim()}
    >
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={toggleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleOpen();
          }
        }}
        className="flex w-full cursor-pointer focus:outline-none"
      >
        {typeof trigger === "function" ? trigger(isOpen) : trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="dropdown-panel"
            role="menu"
            variants={dropdownPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`absolute z-50 ${placementClass} rounded-2xl border border-midnight-teal/10 bg-white/95 p-1.5 shadow-xl shadow-midnight-teal/10 backdrop-blur-md ${alignmentClass} ${width} ${menuClassName}`.trim()}
          >
            {children ? (
              children
            ) : items ? (
              <ul className="flex flex-col gap-0.5 m-0 p-0 list-none">
                {items.map((item) => (
                  <DropdownItem
                    key={String(item.id)}
                    icon={item.icon}
                    checked={item.checked}
                    disabled={item.disabled}
                    danger={item.danger}
                    onClick={() => {
                      item.onClick?.();
                      const shouldClose =
                        closeOnSelect ?? item.checked === undefined;
                      if (shouldClose) setOpen(false);
                    }}
                  >
                    {item.label}
                  </DropdownItem>
                ))}
              </ul>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dropdown;