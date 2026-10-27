import type { AdminNavMenuConfig } from "../types/adminLayoutView.types";

/**
 * Branding and identity constants for the Admin layout shell.
 */
export const ADMIN_BRAND = {
  name: "TELEO",
  logoSrc: "/teleo-logo.png",
  logoAlt: "Teleo",
} as const;

/**
 * Master configuration for all admin navigation items and their feature gates.
 */
export const ADMIN_NAV_MENU_CONFIG: readonly AdminNavMenuConfig[] = [
  {
    to: "/admin/dashboard",
    label: "Home",
  },
  {
    to: "/admin/events",
    label: "Events and Announcements",
    featureKey: "events_announcement",
  },
  {
    to: "/admin/content",
    label: "Content Management",
    featureKey: "content_management",
  },
  {
    to: "/admin/services",
    label: "Services",
    featureKey: "services",
  },
  {
    to: "/admin/community",
    label: "Community",
    featureKey: "community",
  },
  {
    to: "/admin/discipleship",
    label: "Discipleship",
    subItems: [
      {
        to: "/admin/discipleship/application",
        label: "Application",
      },
    ],
  },
  {
    to: "/admin/registrations",
    label: "Registrations",
    featureKey: "registrations",
  },
  {
    to: "/admin/prayer-wall",
    label: "Prayer Wall",
    featureKey: "prayer_wall",
  },
  {
    to: "/admin/users",
    label: "User Account Management",
  },
  {
    to: "/admin/settings",
    label: "Settings",
  },
] as const;
