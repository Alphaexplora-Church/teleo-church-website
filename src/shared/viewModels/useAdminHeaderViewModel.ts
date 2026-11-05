import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export function useAdminHeaderViewModel() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async (): Promise<void> => {
        setIsLoggingOut(true);
        try {
            await logout();
        } catch (error: unknown) {
            // Session is cleared client-side regardless; surface for diagnostics only.
            console.error('Logout API error:', error);
        } finally {
            setIsLoggingOut(false);
            navigate('/login');
        }
    };

    return {
        userName: user?.username || 'Admin',
        isLoggingOut,
        logout: handleLogout,
    };
}
