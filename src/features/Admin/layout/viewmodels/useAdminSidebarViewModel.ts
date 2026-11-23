import { useCallback, useState } from "react";
import { useAuth } from "../../../../shared/context/useAuth";
import type { FeaturesConfig } from "../../../../shared/models/types/auth.types";
import { ADMIN_NAV_MENU_CONFIG } from "../models/constants/adminLayoutView.constants";
import type {
  AdminNavItem,
  AdminSidebarViewModel,
} from "../models/types/adminLayoutView.types";
import { usePendingApplicationsCount } from "../../discipleship/models/utils/discipleshipApplication.store";

export type {
  AdminNavItem,
  AdminNavSubItem,
  AdminSidebarViewModel,
} from "../models/types/adminLayoutView.types";

/**
 * useAdminSidebarViewModel
 *
 * Bridges the global auth state to the AdminLayout navigation.
 * Evaluates feature gates against ADMIN_NAV_MENU_CONFIG, manages sidebar collapse state,
 * and returns the active list of navigation links including icons and nested subItems.
 */
export function useAdminSidebarViewModel(): AdminSidebarViewModel {
  const { features } = useAuth();
  const pendingApplicationsCount = usePendingApplicationsCount();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const expand = useCallback(() => {
    setIsCollapsed(false);
  }, []);

  const collapse = useCallback(() => {
    setIsCollapsed(true);
  }, []);

  /**
   * Helper: returns the feature flag value or false as a safe fallback.
   */
  const can = (feature: Extract<keyof FeaturesConfig, string>): boolean =>
    features?.[feature] ?? false;

  const navLinks: AdminNavItem[] = ADMIN_NAV_MENU_CONFIG.filter((item) => {
    if (!item.featureKey) return true;
    return can(item.featureKey);
  }).map(({ to, label, icon, subItems }) => ({
    to,
    label,
    icon,
    subItems: subItems?.map((sub) => {
      if (sub.to === "/admin/discipleship/application") {
        return {
          ...sub,
          count: pendingApplicationsCount,
        };
      }
      return sub;
    }),
  }));

  return {
    navLinks,
    isCollapsed,
    toggleCollapse,
    expand,
    collapse,
    pendingApplicationsCount,
  };
}
