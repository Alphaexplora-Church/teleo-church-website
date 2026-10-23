import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../shared/context/useAuth";
import type { FeaturesConfig } from "../shared/models/types/auth.types";

export interface FeatureGuardProps {
  requiredFeature: keyof FeaturesConfig;
  redirectTo?: string;
  children?: ReactNode;
}

/**
 * FeatureGuard
 *
 * RBAC feature guard that enforces church subscription/feature-level access control.
 * Prevents unauthorized access to modules disabled for the church.
 *
 * - Returns null while session/features are loading (prevents flicker/premature redirect).
 * - Enforces fail-closed redirect if features are missing or the required feature is disabled.
 * - Supports both layout route pattern (<Outlet />) and wrapper pattern ({children}).
 */
export function FeatureGuard({
  requiredFeature,
  redirectTo = "/admin/dashboard",
  children,
}: FeatureGuardProps) {
  const { features, isLoading } = useAuth();

  // Prevent flicker or premature redirect while session is rehydrating
  if (isLoading) {
    return null;
  }

  // Handle singular/plural aliasing for events announcement feature flag
  const isEnabled = Boolean(
    features?.[requiredFeature] ??
    (requiredFeature === "events_announcements"
      ? features?.["events_announcement"]
      : false) ??
    (requiredFeature === "events_announcement"
      ? features?.["events_announcements"]
      : false),
  );

  // Fail-closed check: redirect if feature flags are unavailable or disabled
  if (!features || !isEnabled) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export default FeatureGuard;
