import { useAuth } from "../../../../shared/context/useAuth";
import type { FeaturesConfig } from "../../../../shared/models/types/auth.types";
import { ADMIN_NAV_MENU_CONFIG } from "../models/constants/adminLayoutView.constants";
import type { AdminNavItem } from "../models/types/adminLayoutView.types";

export type { AdminNavItem, AdminNavSubItem } from "../models/types/adminLayoutView.types";

/**
 * useAdminSidebarViewModel
 *
 * Bridges the global auth state to the AdminLayout navigation.
 * Evaluates feature gates against ADMIN_NAV_MENU_CONFIG and returns
 * the active list of navigation links including nested subItems.
 */
export function useAdminSidebarViewModel() {
  const { features } = useAuth();

  /**
   * Helper: returns the feature flag value or false as a safe fallback.
   * This prevents the sidebar from showing locked features if the
   * features_config was not returned by the backend.
   */
  const can = (feature: Extract<keyof FeaturesConfig, string>): boolean =>
    features?.[feature] ?? false;

  const navLinks: AdminNavItem[] = ADMIN_NAV_MENU_CONFIG.filter((item) => {
    if (!item.featureKey) return true;
    return can(item.featureKey);
  }).map(({ to, label, subItems }) => ({
    to,
    label,
    subItems,
  }));

  return {
    navLinks,
    /** Show the Prayer Wall management link */
    showPrayerWall: can("prayer_wall"),
    /** Show the Content Management link */
    showContentManagement: can("content_management"),
    /** Show the Services link */
    showServices: can("services"),
    /** Show the Community link */
    showCommunity: can("community"),
    /** Show the Giving link */
    showGiving: can("giving"),
    /** Show the Events & Announcements link */
    showEventsAnnouncement: can("events_announcement"),
    /** Show the Registrations link */
    showRegistrations: can("registrations"),
  };
}
