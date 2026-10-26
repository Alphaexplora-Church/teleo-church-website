import type { ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import {
  type LinkButtonVariant,
  type LinkButtonSize,
  variantStyle,
  sizeStyle,
  baseStyle,
} from "./linkButton.styles";

interface LinkButtonProps extends Omit<LinkProps, "to"> {
  to?: LinkProps["to"];
  href?: string;
  variant?: LinkButtonVariant;
  size?: LinkButtonSize;
  children: ReactNode;
}

export function LinkButton({
  to,
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: LinkButtonProps) {
  const selectedVariant = variantStyle[variant];
  const selectedSize = sizeStyle[size];
  const destination = to ?? href ?? "";

  return (
    <Link
      to={destination}
      className={`${baseStyle} ${selectedVariant} ${selectedSize} ${className}`.trim()}
      {...props}
    >
      {children}
    </Link>
  );
}

export default LinkButton;
