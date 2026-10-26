import type { FeaturesConfig } from "../../../../../shared/models/types/auth.types";

/**
 * Definition for a sub-item under a parent navigation menu.
 */
export interface AdminNavSubItem {
  to: string;
  label: string;
}

/**
 * Configuration contract for an Admin Sidebar navigation menu item.
 */
export interface AdminNavMenuConfig {
  to: string;
  label: string;
  featureKey?: Extract<keyof FeaturesConfig, string>;
  subItems?: readonly AdminNavSubItem[];
}

/**
 * Resolved navigation item ready for rendering in the view.
 */
export interface AdminNavItem {
  to: string;
  label: string;
  subItems?: readonly AdminNavSubItem[];
}
