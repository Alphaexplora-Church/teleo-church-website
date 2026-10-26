import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  type ToggleSwitchSize,
  toggleSwitchSizes,
} from "./toggleSwitch.styles";

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  children?: ReactNode;
  labelPosition?: "left" | "right";
  size?: ToggleSwitchSize;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  children,
  labelPosition = "left",
  size = "md",
  className = "",
  id,
  "aria-label": ariaLabel,
}: ToggleSwitchProps) {
  const currentSize = toggleSwitchSizes[size];

  const handleToggle = () => {
    if (!disabled) onChange(!checked);
  };

  const switchButton = (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={typeof children === "string" ? children : ariaLabel}
      disabled={disabled}
      onClick={handleToggle}
      className={`relative inline-flex shrink-0 items-center rounded-full border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 ${currentSize.track
        } ${checked
          ? "bg-primary border-primary"
          : "bg-white border-midnight-teal/25"
        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <motion.span
        aria-hidden="true"
        className={`pointer-events-none inline-block rounded-full shadow-sm ${currentSize.thumb
          } ${checked ? "bg-white" : "bg-midnight-teal/50"}`}
        animate={{
          x: checked ? currentSize.travelDistance : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      />
    </button>
  );

  if (!children) return switchButton;

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        } ${className}`.trim()}
      onClick={handleToggle}
    >
      {labelPosition === "left" && (
        <span className={`font-medium text-midnight-teal ${currentSize.text}`}>
          {children}
        </span>
      )}

      {switchButton}

      {labelPosition === "right" && (
        <span className={`font-medium text-midnight-teal ${currentSize.text}`}>
          {children}
        </span>
      )}
    </div>
  );
}

export default ToggleSwitch;