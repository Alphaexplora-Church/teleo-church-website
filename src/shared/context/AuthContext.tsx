import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthUser, ChurchFeatures } from '../models/globalTypes';
import { AuthContext, type AuthContextValue } from './authContextInstance';
import { LoginModel } from '../../features/Auth/login/model/login.model';
import type { LoginCredentials } from '../../features/Auth/login/model/login.model';

const MOCK_USER: AuthUser = {
    uid: 'design-mode',
    email: 'admin@teleo.church',
    username: 'Admin',
    roles: ['admin'],
    home_church_id: 1,
    profile_picture_url: null,
    features_config: {
        prayer_wall: true,
        content_management: true,
        services: true,
        community: true,
        giving: true,
        events_announcement: true,
        registrations: true,
    },
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const isDev = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_AUTH !== 'false';

    const [user, setUser] = useState<AuthUser | null>(isDev ? MOCK_USER : null);
    const [isLoading, setIsLoading] = useState(!isDev);

    useEffect(() => {
        if (isDev) return;
        let cancelled = false;
        LoginModel.getCurrentUser()
            .then((u) => { if (!cancelled) setUser(u); })
            .finally(() => { if (!cancelled) setIsLoading(false); });
        return () => { cancelled = true; };
    }, [isDev]);

    const login = useCallback(async (credentials: LoginCredentials) => {
      const authUser = await LoginModel.authenticate(credentials);
      setUser(authUser);
    }, []);

    const logout = useCallback(async () => {
        if (isDev) return;
        await LoginModel.logout();
        setUser(null);
    }, [isDev]);

    const features: ChurchFeatures | null = user?.features_config ?? null;

    const value = useMemo<AuthContextValue>(() => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      features,
      login,
      logout,
    }), [user, isLoading, features, login, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
