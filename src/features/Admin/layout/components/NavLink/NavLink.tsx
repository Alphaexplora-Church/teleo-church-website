import {
  NavLink as RouterNavLink,
  type NavLinkProps as RouterNavLinkProps,
  type NavLinkRenderProps,
} from "react-router-dom";
import {
  type NavLinkVariant,
  type NavLinkSize,
  variantStyle,
  sizeStyle,
  baseStyle,
} from "./navLink.styles";

interface NavLinkProps extends Omit<RouterNavLinkProps, "to"> {
  to?: RouterNavLinkProps["to"];
  href?: string;
  variant?: NavLinkVariant;
  size?: NavLinkSize;
  activeClassName?: string;
}

export function NavLink({
  to,
  href,
  variant,
  size,
  className = "",
  activeClassName = "",
  children,
  ...props
}: NavLinkProps) {
  const selectedVariant = variant ? variantStyle[variant] : "";
  const selectedSize = size ? sizeStyle[size] : "";
  const destination = to ?? href ?? "";

  return (
    <RouterNavLink
      to={destination}
      className={(renderProps: NavLinkRenderProps) => {
        const custom = typeof className === "function" ? className(renderProps) : className;
        const active = renderProps.isActive && activeClassName ? activeClassName : "";
        const base = variant || size ? baseStyle : "";
        return `${base} ${selectedVariant} ${selectedSize} ${custom} ${active}`.trim();
      }}
      {...props}
    >
      {children}
    </RouterNavLink>
  );
}

export default NavLink;
