import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../shared/context/useAuth";
import type { FeaturesConfig } from "../shared/models/types/auth";

export interface ProtectedRouteProps {
  redirectTo?: string;
  requiredFeature?: keyof FeaturesConfig;
}

/**
 * Route guard barrier to prevent Flash of Unauthenticated Content (FOUC).
 * Suspends rendering until session rehydration finishes, then enforces fail-closed checks.
 */
export function ProtectedRoute({
  redirectTo = "/login",
  requiredFeature,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, features } = useAuth();

  // ─── Loading Barrier (Prevents FOUC during GET /api/auth/me) ────────────────
  if (isLoading) {
    return (
      <div
        id="auth-loading-barrier"
        className="grid min-h-screen place-items-center bg-[#002E38]"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-[#EC662C]" />
          <span className="text-xs font-medium tracking-wide text-white/70">
            Verifying session...
          </span>
        </div>
      </div>
    );
  }

  // ─── Authentication Check ───────────────────────────────────────────────────
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // ─── RBAC Feature Flag Check (Fail-closed) ───────────────────────────────────
  if (requiredFeature && !(features?.[requiredFeature] ?? false)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
