import { type ComponentType, lazy } from "react";
import { Navigate, type RouteObject } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { FeatureGuard } from "./FeatureGuard";
import AdminLayoutView from "../features/Admin/views/AdminLayoutView";

function safeLazy<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      const component = await factory();
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("vite_chunk_reload_retry");
      }
      return component;
    } catch (error) {
      if (typeof window !== "undefined") {
        const hasReloaded = sessionStorage.getItem("vite_chunk_reload_retry");
        if (!hasReloaded) {
          sessionStorage.setItem("vite_chunk_reload_retry", "true");
          window.location.reload();
        }
      }
      throw error;
    }
  });
}

// Views
const LoginView = safeLazy(
  () => import("../features/Auth/login/view/LoginView"),
);
const AdminDashboardView = safeLazy(
  () => import("../features/Admin/dashboard/view/AdminDashboardView"),
);
const AdminEventsView = safeLazy(
  () => import("../features/Admin/events/view/AdminEventsView"),
);
const AdminContentView = safeLazy(
  () => import("../features/Admin/content/view/AdminContentView"),
);
const AdminPrayerWallView = safeLazy(
  () => import("../features/Admin/prayer-wall/view/AdminPrayerWallView"),
);
const AdminRegistrationsView = safeLazy(
  () => import("../features/Admin/registrations/view/AdminRegistrationsView"),
);
const AdminUsersView = safeLazy(
  () => import("../features/Admin/users/view/AdminUsersView"),
);
const AdminSettingsView = safeLazy(
  () => import("../features/Admin/settings/view/AdminSettingsView"),
);

export const adminRoutes: RouteObject[] = [
  {
    path: "/admin",
    element: <ProtectedRoute redirectTo="/login" />,
    children: [
      {
        element: <AdminLayoutView />,
        children: [
          { path: "dashboard", element: <AdminDashboardView /> },
          { path: "users", element: <AdminUsersView /> },
          { path: "settings", element: <AdminSettingsView /> },
          {
            element: <FeatureGuard requiredFeature="registrations" />,
            children: [
              { path: "registrations", element: <AdminRegistrationsView /> },
            ],
          },
          {
            element: <FeatureGuard requiredFeature="events_announcements" />,
            children: [{ path: "events", element: <AdminEventsView /> }],
          },
          {
            element: <FeatureGuard requiredFeature="content_management" />,
            children: [{ path: "content", element: <AdminContentView /> }],
          },
          {
            element: <FeatureGuard requiredFeature="prayer_wall" />,
            children: [
              { path: "prayer-wall", element: <AdminPrayerWallView /> },
            ],
          },
        ],
      },
    ],
  },
];

export const publicRoutes: RouteObject[] = [
  { path: "/login", element: <LoginView /> },
  { path: "/", element: <Navigate to="/admin/dashboard" replace /> },
  { path: "*", element: <Navigate to="/admin/dashboard" replace /> },
];

export const routes: RouteObject[] = [...publicRoutes, ...adminRoutes];
