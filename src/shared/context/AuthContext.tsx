import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AuthUser,
  LoginCredentials,
  FeaturesConfig,
} from "../models/types/auth";
import { AuthContext, type AuthContextValue } from "./authContextInstance";
import { LoginModel } from "../../features/Auth/login/model/login.model";

const SESSION_ACTIVE_KEY = "teleo_admin_session_active";

export function AuthProvider({ children }: { children: ReactNode }) {
  // Fail-closed initial state: strictly unauthenticated until session is verified
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ─── Session-Only Active Guard & Rehydration ────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const hasActiveSession =
      typeof window !== "undefined" &&
      sessionStorage.getItem(SESSION_ACTIVE_KEY) === "1";

    // If browser/tab was closed, sessionStorage is empty: force login
    if (!hasActiveSession) {
      if (isMounted) {
        setUser(null);
        setIsLoading(false);
      }
      return;
    }

    // Active session found in current tab: rehydrate from live backend
    setIsLoading(true);
    LoginModel.getCurrentUser()
      .then((currentUser) => {
        if (!isMounted) return;
        if (currentUser) {
          setUser(currentUser);
        } else {
          sessionStorage.removeItem(SESSION_ACTIVE_KEY);
          setUser(null);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        sessionStorage.removeItem(SESSION_ACTIVE_KEY);
        setUser(null);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // ─── Listen for 401 Unauthorized Eviction from Axios Interceptor ────────────
  useEffect(() => {
    const handleUnauthorized = () => {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(SESSION_ACTIVE_KEY);
      }
      setUser(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  // ─── Login handler ─────────────────────────────────────────────────────────
  const login = useCallback(async (credentials: LoginCredentials) => {
    const authUser = await LoginModel.authenticate(credentials);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_ACTIVE_KEY, "1");
    }
    setUser(authUser);
  }, []);

  // ─── Logout handler ────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(SESSION_ACTIVE_KEY);
      }
      await LoginModel.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const features: FeaturesConfig | null = user?.features_config ?? null;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      features,
      login,
      logout,
    }),
    [user, isLoading, features, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
