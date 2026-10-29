import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { sizeStyle, type ButtonSize } from "../Button/button.styles";

export interface TabOption<T extends string = string> {
  id: T;
  label: string;
  count?: number;
  icon?: ReactNode;
}

export interface TabSwitchProps<T extends string = string> {
  tabs: readonly TabOption<T>[] | TabOption<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  layoutId?: string;
  size?: ButtonSize;
  className?: string;
  containerClassName?: string;
  buttonClassName?: string;
  fullWidth?: boolean | "mobile";
  activePillClassName?: string;
  activeTextClassName?: string;
  inactiveTextClassName?: string;
}

export function TabSwitch<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  layoutId = "tab-active-pill",
  size = "md",
  className = "",
  containerClassName,
  buttonClassName = "",
  fullWidth = false,
  activePillClassName = "bg-primary shadow-md shadow-primary/20",
  activeTextClassName = "text-white hover:text-white",
  inactiveTextClassName = "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60",
}: TabSwitchProps<T>) {
  const isFullWidth = fullWidth === true;
  const isMobileFullWidth = fullWidth === "mobile";

  const containerWidthClass = isFullWidth
    ? "w-full"
    : isMobileFullWidth
      ? "w-full md:w-fit"
      : "w-fit";

  const itemWidthClass = isFullWidth
    ? "flex-1"
    : isMobileFullWidth
      ? "flex-1 md:flex-initial"
      : "";

  const containerClass = containerClassName
    ? `${containerClassName} ${containerWidthClass} ${className}`.trim()
    : `inline-flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur-md ${containerWidthClass} ${className}`.trim();

  const pillRadius = activePillClassName.includes("rounded-") ? "" : "rounded-xl";

  return (
    <div role="tablist" className={containerClass}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const defaultButtonPadding = buttonClassName ? "" : `${sizeStyle[size]} rounded-xl`;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative isolate flex items-center justify-center gap-1.5 font-semibold transition-colors duration-200 select-none cursor-pointer focus:outline-none ${itemWidthClass} ${defaultButtonPadding} ${
              isActive ? activeTextClassName : inactiveTextClassName
            } ${buttonClassName}`.trim()}
          >
            {/* Sliding Pill Background — strictly positioned on parent boundary without Y-axis variance */}
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className={`absolute inset-0 -z-10 pointer-events-none ${pillRadius} ${activePillClassName}`.trim()}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                style={{ originY: 0 }}
              />
            )}

            <span className="relative z-10 flex items-center justify-center gap-1.5 w-full">
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span className="truncate">{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default TabSwitch;