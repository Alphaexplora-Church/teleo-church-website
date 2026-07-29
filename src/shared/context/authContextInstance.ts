import { createContext } from 'react';
import type { AuthUser, LoginCredentials } from '../../features/Auth/login/model/login.model';
import type { ChurchFeatures } from '../../shared/models/globalTypes';

export interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    /** Feature flags for the current admin's church. Null when not yet loaded. */
    features: ChurchFeatures | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

