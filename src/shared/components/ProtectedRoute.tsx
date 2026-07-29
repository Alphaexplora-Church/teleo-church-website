import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="grid min-h-screen place-items-center bg-midnight-teal">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-soft-linen/20 border-t-harvest-orange" />
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return <>{children}</>;
}
