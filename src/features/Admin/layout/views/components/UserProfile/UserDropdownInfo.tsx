import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut } from "lucide-react";
import type { AuthUser } from "../../../../../../shared/models/types/auth.types";
import {
  DropdownHeader,
  DropdownDivider,
  DropdownItem,
} from "../../../../../../shared/components/Dropdown/Dropdown";

export interface UserDropdownInfoProps {
  user?: AuthUser | null;
  onClose?: () => void;
  onLogout?: () => Promise<void> | void;
  isLoggingOut?: boolean;
}

export function UserDropdownInfo({
  user,
  onClose,
  onLogout,
  isLoggingOut = false,
}: UserDropdownInfoProps) {
  const navigate = useNavigate();

  const displayName = user?.username || "Admin User";
  const email = user?.email || "";

  return (
    <div className="py-1">
      {/* User Header Details */}
      <DropdownHeader className="pb-2">
        <div className="flex flex-col">
          <span className="font-bold text-midnight-teal text-xs normal-case truncate">
            {displayName}
          </span>
          {email && (
            <span className="text-[11px] font-normal text-midnight-teal/60 normal-case truncate">
              {email}
            </span>
          )}
        </div>
      </DropdownHeader>

      <DropdownDivider />

      {/* Menu Options matching wireframe */}
      <DropdownItem
        icon={<User className="h-4 w-4 text-midnight-teal/70" />}
        onClick={() => {
          onClose?.();
          navigate("/admin/settings");
        }}
      >
        User Profile
      </DropdownItem>

      <DropdownItem
        icon={<Settings className="h-4 w-4 text-midnight-teal/70" />}
        onClick={() => {
          onClose?.();
          navigate("/admin/settings");
        }}
      >
        Settings
      </DropdownItem>

      <DropdownDivider />

      <DropdownItem
        icon={<LogOut className="h-4 w-4 text-red-500" />}
        danger
        disabled={isLoggingOut}
        onClick={() => {
          onClose?.();
          void onLogout?.();
        }}
      >
        {isLoggingOut ? "Signing out..." : "Logout"}
      </DropdownItem>
    </div>
  );
}

export default UserDropdownInfo;

