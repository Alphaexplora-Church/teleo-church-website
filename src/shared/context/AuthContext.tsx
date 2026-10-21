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

const MOCK_USER: AuthUser = {
  uid: "design-mode",
  email: "admin@teleo.church",
  username: "Admin",
  roles: ["admin"],
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
  // Opt-in mock auth ONLY when explicitly set to 'true' in env
  const isMockAuth =
    import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_AUTH === "true";

  // Fail-closed initial state when connecting to live backend
  const [user, setUser] = useState<AuthUser | null>(
    isMockAuth ? MOCK_USER : null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(!isMockAuth);

  // ─── Fail-Closed Session Rehydration ────────────────────────────────────────
  useEffect(() => {
    if (isMockAuth) {
      setUser(MOCK_USER);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    LoginModel.getCurrentUser()
      .then((currentUser) => {
        if (isMounted) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isMockAuth]);

  // ─── Listen for 401 Unauthorized Eviction from Axios Interceptor ────────────
  useEffect(() => {
    if (isMockAuth) return;

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [isMockAuth]);

  // ─── Login handler ─────────────────────────────────────────────────────────
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      if (isMockAuth) {
        setUser(MOCK_USER);
        return;
      }
      const authUser = await LoginModel.authenticate(credentials);
      setUser(authUser);
    },
    [isMockAuth],
  );

  // ─── Logout handler ────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      if (!isMockAuth) {
        await LoginModel.logout();
      }
    } finally {
      setUser(null);
    }
  }, [isMockAuth]);

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
