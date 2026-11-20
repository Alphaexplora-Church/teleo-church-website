import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../shared/context/useAuth";
import type { AdminHeaderViewModel } from "../models/types/adminLayoutView.types";

export function useAdminHeaderViewModel(): AdminHeaderViewModel {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error: unknown) {
      // Session is cleared client-side regardless; surface for diagnostics only.
      console.error("Logout API error:", error);
    } finally {
      setIsLoggingOut(false);
      navigate("/login");
    }
  };

  // Derive Church Name from user session or fallback cleanly to "No Church"
  const rawUser = user as unknown as Record<string, unknown> | null;
  const churchName =
    (typeof rawUser?.church_name === "string" && rawUser.church_name.trim()) ||
    (typeof rawUser?.home_church_name === "string" && rawUser.home_church_name.trim()) ||
    (typeof (rawUser?.church as Record<string, unknown>)?.name === "string" &&
      ((rawUser?.church as Record<string, unknown>).name as string).trim()) ||
    "No Church";

  return {
    userName: user?.username || "Admin",
    churchName,
    user,
    isLoggingOut,
    logout: handleLogout,
  };
}
