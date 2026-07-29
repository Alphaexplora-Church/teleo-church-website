import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LoginModel, type AuthUser, type LoginCredentials } from '../../features/Auth/login/model/login.model';
import { AuthContext, type AuthContextValue } from './authContextInstance';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let active = true;
        LoginModel.getCurrentUser()
            .then(current => { if (active) setUser(current); })
            .catch(() => { if (active) setUser(null); })
            .finally(() => { if (active) setIsLoading(false); });
        return () => { active = false; };
    }, []);

    const login = useCallback(async (credentials: LoginCredentials) => {
        const authUser = await LoginModel.authenticate(credentials);
        setUser(authUser);
    }, []);

    const logout = useCallback(async () => {
        try {
            await LoginModel.logout();
        } finally {
            setUser(null);
        }
    }, []);

    const value = useMemo<AuthContextValue>(() => ({
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
    }), [user, isLoading, login, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
