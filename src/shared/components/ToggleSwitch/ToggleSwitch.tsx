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
    if (!disabled) {
      onChange(!checked);
    }
  };

  const track = (
    <span
      className={`relative inline-flex shrink-0 items-center rounded-full border transition-colors duration-200 ${
        currentSize.track
      } ${
        checked
          ? "bg-primary border-primary"
          : "bg-white border-midnight-teal/25"
      }`}
    >
      <motion.span
        aria-hidden="true"
        className={`pointer-events-none inline-block rounded-full shadow-sm ${
          currentSize.thumb
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
    </span>
  );

  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={typeof children === "string" ? children : ariaLabel}
      disabled={disabled}
      onClick={handleToggle}
      className={`inline-flex items-center gap-3 select-none text-left transition-all duration-200 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-midnight-teal/20 rounded-xl ${
        disabled
          ? "cursor-not-allowed opacity-50 pointer-events-none"
          : "cursor-pointer"
      } ${className}`.trim()}
    >
      {children && labelPosition === "left" && (
        <span className={`font-medium text-midnight-teal ${currentSize.text}`}>
          {children}
        </span>
      )}

      {track}

      {children && labelPosition === "right" && (
        <span className={`font-medium text-midnight-teal ${currentSize.text}`}>
          {children}
        </span>
      )}
    </button>
  );
}

export default ToggleSwitch;