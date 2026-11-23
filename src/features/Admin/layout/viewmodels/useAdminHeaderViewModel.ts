import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../shared/context/useAuth";
import type { AdminHeaderViewModel } from "../models/types/adminLayoutView.types";
import { extractChurchName } from "../models/utils/adminLayout.utils";

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

  const churchName = extractChurchName(user);

  return {
    userName: user?.username || "Admin",
    churchName,
    user,
    isLoggingOut,
    logout: handleLogout,
  };
}
