import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  type ButtonVariant,
  type ButtonSize,
  variantStyle,
  sizeStyle,
  baseStyle,
} from "./button.styles";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const selectedVariant = variantStyle[variant];
  const selectedSize = sizeStyle[size];

  return (
    <button
      className={`${baseStyle} ${selectedVariant} ${selectedSize} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
