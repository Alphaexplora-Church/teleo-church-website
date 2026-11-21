import type { AuthUser } from "../../../../../shared/models/types/auth.types";
import type { AdminNavItem } from "../types/adminLayoutView.types";

export interface NavItemActiveState {
  isExactActive: boolean;
  isChildActive: boolean;
  isActive: boolean;
  isSelfOrChildActive: boolean;
}

/**
 * Evaluates whether a navigation item or any of its sub-items matches the current route.
 */
export function isNavItemActive(
  pathname: string,
  item: Pick<AdminNavItem, "to" | "subItems">
): NavItemActiveState {
  const isExactActive = pathname === item.to;
  const isChildActive = Boolean(
    item.subItems?.some(
      (sub) => pathname === sub.to || pathname.startsWith(`${sub.to}/`)
    )
  );
  const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
  const isActive = isExactActive || (!hasSubItems && pathname.startsWith(`${item.to}/`));
  const isSelfOrChildActive = isActive || isChildActive;

  return {
    isExactActive,
    isChildActive,
    isActive,
    isSelfOrChildActive,
  };
}

/**
 * Extracts the church name from the authenticated user context with safe fallbacks.
 */
export function extractChurchName(user: AuthUser | null): string {
  if (!user) return "No Church";

  const rawUser = user as unknown as Record<string, unknown>;
  const churchObj = rawUser.church as Record<string, unknown> | undefined;

  const candidates = [
    rawUser.church_name,
    rawUser.home_church_name,
    churchObj?.name,
  ];

  for (const name of candidates) {
    if (typeof name === "string" && name.trim().length > 0) {
      return name.trim();
    }
  }

  return "No Church";
}

