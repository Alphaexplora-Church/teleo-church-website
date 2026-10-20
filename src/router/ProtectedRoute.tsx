import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../shared/context/useAuth";
import type { ChurchFeatures } from "../shared/models/globalTypes";

export interface ProtectedRouteProps {
  redirectTo?: string;
  requiredFeature?: keyof ChurchFeatures;
}

export function ProtectedRoute({
  redirectTo = "/login",
  requiredFeature,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, features } = useAuth();

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#002E38]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-[#EC662C]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Fail-closed kapag false, undefined, o null ang feature
  if (requiredFeature && !(features?.[requiredFeature] ?? false)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
