import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import type { ChurchFeatures } from '../models/globalTypes';

interface ProtectedRouteProps {
    children: ReactNode;
    /** If provided, the user is redirected to the dashboard if their church lacks this feature. */
    requiredFeature?: keyof ChurchFeatures;
}

export default function ProtectedRoute({ children, requiredFeature }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, features } = useAuth();

    if (isLoading) {
        return (
            <div className="grid min-h-screen place-items-center bg-midnight-teal">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-soft-linen/20 border-t-harvest-orange" />
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    // If a feature is required but the church has it disabled, redirect to dashboard
    if (requiredFeature && features?.[requiredFeature] === false) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return <>{children}</>;
}

