import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "../Button/Button";
import type { ButtonSize } from "../Button/button.styles";

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
  fullWidth?: boolean | "mobile";
}

export function TabSwitch<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  layoutId = "tab-active-pill",
  size = "md",
  className = "",
  fullWidth = false,
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

  return (
    <div
      role="tablist"
      className={`inline-flex items-center gap-1 rounded-2xl border border-midnight-teal/10 bg-white/80 p-1.5 shadow-sm backdrop-blur-md ${containerWidthClass} ${className}`.trim()}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <div
            key={tab.id}
            className={`relative ${itemWidthClass}`}
          >
            {/* Sliding Pill Background */}
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-xl bg-midnight-teal shadow-md shadow-midnight-teal/15 pointer-events-none"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}

            <Button
              type="button"
              role="tab"
              aria-selected={isActive}
              variant="ghost"
              size={size}
              onClick={() => onChange(tab.id)}
              className={`relative z-10 w-full rounded-xl font-semibold transition-colors duration-200 select-none ${isActive
                  ? "text-white hover:text-white"
                  : "text-midnight-teal/70 hover:text-midnight-teal hover:bg-white/40"
                }`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
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

            </Button>
          </div>
        );
      })}
    </div>
  );
}

export default TabSwitch;