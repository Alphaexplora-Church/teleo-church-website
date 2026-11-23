import { useState } from "react";
import { useLocation } from "react-router-dom";
import { User as UserIcon } from "lucide-react";
import type { AuthUser } from "../../../../../../shared/models/types/auth.types";
import { Dropdown } from "../../../../../../shared/components/Dropdown/Dropdown";
import { UserDropdownInfo } from "./UserDropdownInfo";

export interface UserProfileProps {
  user?: AuthUser | null;
  onLogout?: () => Promise<void> | void;
  isLoggingOut?: boolean;
  className?: string;
}

export function UserProfile({
  user,
  onLogout,
  isLoggingOut = false,
  className = "",
}: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const location = useLocation();

  const displayName = user?.username || user?.email?.split("@")[0] || "Admin";
  const avatarUrl = user?.profile_picture_url;

  const trigger = (
    <button
      type="button"
      className={`group flex cursor-pointer select-none items-center gap-2.5 rounded-full border border-midnight-teal/15 bg-white/80 py-1 pl-1 pr-3.5 shadow-2xs backdrop-blur-md transition-all duration-200 hover:border-midnight-teal/30 hover:bg-white hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/20 ${className}`.trim()}
    >
      {/* Avatar with fallback skeleton/gray circle */}
      {avatarUrl && !imageError ? (
        <img
          src={avatarUrl}
          alt={displayName}
          onError={() => setImageError(true)}
          className="h-8 w-8 rounded-full object-cover ring-1 ring-midnight-teal/10"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-500 shadow-inner">
          <UserIcon className="h-4 w-4" />
        </div>
      )}

      {/* User Name Pill text */}
      <span className="font-sans text-xs font-semibold text-midnight-teal truncate max-w-[120px] sm:max-w-[160px]">
        {displayName}
      </span>
    </button>
  );

  return (
    <Dropdown
      key={location.pathname}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={trigger}
      align="right"
      width="w-56"
      menuClassName="p-1.5 shadow-xl shadow-midnight-teal/10"
    >
      <UserDropdownInfo
        user={user}
        onClose={() => setIsOpen(false)}
        onLogout={onLogout}
        isLoggingOut={isLoggingOut}
      />
    </Dropdown>
  );
}

export default UserProfile;

