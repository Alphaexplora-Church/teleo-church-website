import { createContext } from 'react';
import type { AuthUser, LoginCredentials, FeaturesConfig } from '../models/types/auth.types';

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Feature flags for the current admin's church. Null when not yet loaded. */
  features: FeaturesConfig | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
