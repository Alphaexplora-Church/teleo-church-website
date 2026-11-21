import type { ComponentType } from "react";
import type { FeaturesConfig, AuthUser } from "../../../../../shared/models/types/auth.types";

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
  icon?: ComponentType<{ className?: string }>;
}

/**
 * Configuration contract for an Admin Sidebar navigation menu item (static definition).
 */
export interface AdminNavMenuConfig {
  to: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
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
  icon?: ComponentType<{ className?: string }>;
  subItems?: readonly AdminNavSubItem[];
  count?: number;
}

/**
 * Props for Desktop Sidebar view component.
 */
export interface AdminSidebarDesktopViewProps {
  brand?: AdminBrand;
  items: readonly AdminNavItem[];
  isCollapsed?: boolean;
  onExpand?: () => void;
  className?: string;
}

/**
 * Props for individual Sidebar Navigation Item.
 */
export interface AdminSidebarItemProps {
  item: AdminNavItem;
  isCollapsed?: boolean;
  onExpand?: () => void;
}

/**
 * ViewModel contract for Admin Header.
 */
export interface AdminHeaderViewModel {
  userName: string;
  churchName: string;
  user: AuthUser | null;
  isLoggingOut: boolean;
  logout: () => Promise<void>;
}

/**
 * Props for AdminHeaderDesktopView component.
 */
export interface AdminHeaderDesktopViewProps {
  churchName?: string;
  user?: AuthUser | null;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onLogout?: () => Promise<void> | void;
  isLoggingOut?: boolean;
}

/**
 * Props for AdminHeaderMobileView component.
 */
export interface AdminHeaderMobileViewProps {
  churchName?: string;
  brand?: AdminBrand;
  items: readonly AdminNavItem[];
  user?: AuthUser | null;
  onLogout?: () => Promise<void> | void;
  isLoggingOut?: boolean;
}

/**
 * Props for DropDownNavmenu component.
 */
export interface DropDownNavmenuProps {
  isOpen: boolean;
  onClose: () => void;
  brand?: AdminBrand;
  user?: AuthUser | null;
  items: readonly AdminNavItem[];
  onLogout?: () => Promise<void> | void;
  isLoggingOut?: boolean;
}

/**
 * ViewModel contract for Admin Sidebar.
 */
export interface AdminSidebarViewModel {
  navLinks: AdminNavItem[];
  isCollapsed: boolean;
  toggleCollapse: () => void;
  expand: () => void;
  collapse: () => void;
  pendingApplicationsCount: number;
  showPrayerWall: boolean;
  showContentManagement: boolean;
  showServices: boolean;
  showCommunity: boolean;
  showGiving: boolean;
  showEventsAnnouncement: boolean;
  showRegistrations: boolean;
}
