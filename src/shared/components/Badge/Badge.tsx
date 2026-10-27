import type { HTMLAttributes, ReactNode } from "react";
import {
  baseBadgeStyle,
  variantStyle,
  sizeStyle,
  dotColorStyle,
  dotSizeStyle,
  standaloneSizeStyle,
  type BadgeVariant,
  type BadgeSize,
} from "./badge.styles";

export type { BadgeVariant, BadgeSize };

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Flag to toggle whether the indicator dot is visible (default: false) */
  dot?: boolean;
  /** Whether the indicator dot has a pulsing animation (default: true) */
  pulseDot?: boolean;
  /** Color theme variant of the badge (default: 'success') */
  variant?: BadgeVariant;
  /** Size variant of the badge (default: 'md') */
  size?: BadgeSize;
  /** Badge content (text, icons, etc.). Optional for standalone dot badges */
  children?: ReactNode;
}

export function Badge({
  dot = false,
  pulseDot = true,
  variant = "success",
  size = "md",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const isStandalone = children === undefined || children === null;
  const sizeClass = isStandalone ? standaloneSizeStyle[size] : sizeStyle[size];
  const variantClass = variantStyle[variant];
  const dotColorClass = dotColorStyle[variant];
  const dotSizeClass = dotSizeStyle[size];

  return (
    <span
      className={`${baseBadgeStyle} ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {dot && (
        <span
          className={`relative flex shrink-0 ${dotSizeClass} ${dotColorClass}`}
          aria-hidden="true"
        >
          {pulseDot && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
          )}
          <span
            className={`relative inline-flex rounded-full ${dotSizeClass} bg-current`}
          />
        </span>
      )}
      {children}
    </span>
  );
}

export default Badge;
