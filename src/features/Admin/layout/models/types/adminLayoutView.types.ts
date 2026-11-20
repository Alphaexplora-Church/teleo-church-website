import type { FeaturesConfig } from "../../../../../shared/models/types/auth.types";

/**
 * Branding contract for the Admin layout shell.
 */
export interface AdminBrand {
  name: string;
  logoSrc: string;
  logoAlt: string;
}

/**
 * Definition for a sub-item under a parent navigation menu.
 */
export interface AdminNavSubItem {
  to: string;
  label: string;
  count?: number;
}

/**
 * Configuration contract for an Admin Sidebar navigation menu item (static definition).
 */
export interface AdminNavMenuConfig {
  to: string;
  label: string;
  featureKey?: Extract<keyof FeaturesConfig, string>;
  subItems?: readonly AdminNavSubItem[];
  count?: number;
}

/**
 * Resolved navigation item ready for rendering in the view.
 */
export interface AdminNavItem {
  to: string;
  label: string;
  subItems?: readonly AdminNavSubItem[];
  count?: number;
}

/**
 * Props for Desktop Sidebar view component.
 */
export interface AdminSidebarDesktopViewProps {
  brand?: AdminBrand;
  items: readonly AdminNavItem[];
  className?: string;
}

/**
 * Props for individual Sidebar Navigation Item.
 */
export interface AdminSidebarItemProps {
  item: AdminNavItem;
}

/**
 * ViewModel contract for Admin Header.
 */
export interface AdminHeaderViewModel {
  userName: string;
  isLoggingOut: boolean;
  logout: () => Promise<void>;
}

/**
 * ViewModel contract for Admin Sidebar.
 */
export interface AdminSidebarViewModel {
  navLinks: AdminNavItem[];
  pendingApplicationsCount: number;
  showPrayerWall: boolean;
  showContentManagement: boolean;
  showServices: boolean;
  showCommunity: boolean;
  showGiving: boolean;
  showEventsAnnouncement: boolean;
  showRegistrations: boolean;
}
