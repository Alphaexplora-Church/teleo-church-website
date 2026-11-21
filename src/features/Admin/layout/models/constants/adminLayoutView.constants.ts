import {
  LayoutDashboard,
  CalendarDays,
  FolderKanban,
  Flame,
  Users,
  UserCheck,
  ClipboardCheck,
  MessageSquareHeart,
  UserCog,
  ClipboardList,
} from "lucide-react";
import type { AdminBrand, AdminNavMenuConfig } from "../types/adminLayoutView.types";

/**
 * Branding and identity constants for the Admin layout shell.
 */
export const ADMIN_BRAND: AdminBrand = {
  name: "TELEO",
  logoSrc: "/teleo-logo.png",
  logoAlt: "Teleo",
} as const;

/**
 * Master configuration for all admin navigation items with their respective Lucide icons and feature gates.
 */
export const ADMIN_NAV_MENU_CONFIG: readonly AdminNavMenuConfig[] = [
  {
    to: "/admin/dashboard",
    label: "Home",
    icon: LayoutDashboard,
  },
  {
    to: "/admin/events",
    label: "Events and Announcements",
    icon: CalendarDays,
    featureKey: "events_announcement",
  },
  {
    to: "/admin/content",
    label: "Content Management",
    icon: FolderKanban,
    featureKey: "content_management",
  },
  {
    to: "/admin/services",
    label: "Services",
    icon: Flame,
    featureKey: "services",
  },
  {
    to: "/admin/community",
    label: "Community",
    icon: Users,
    featureKey: "community",
  },
  {
    to: "/admin/discipleship",
    label: "Discipleship",
    icon: UserCheck,
    subItems: [
      {
        to: "/admin/discipleship/application",
        label: "Application",
        icon: ClipboardList,
      },
    ],
  },
  {
    to: "/admin/registrations",
    label: "Registrations",
    icon: ClipboardCheck,
    featureKey: "registrations",
  },
  {
    to: "/admin/prayer-wall",
    label: "Prayer Wall",
    icon: MessageSquareHeart,
    featureKey: "prayer_wall",
  },
  {
    to: "/admin/users",
    label: "User Account Management",
    icon: UserCog,
  },
] as const;
