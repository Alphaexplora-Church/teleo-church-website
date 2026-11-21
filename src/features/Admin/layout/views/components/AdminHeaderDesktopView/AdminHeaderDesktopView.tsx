import { Menu } from "lucide-react";
import type { AdminHeaderDesktopViewProps } from "../../../models/types/adminLayoutView.types";
import { UserProfile } from "../UserProfile/UserProfile";
import { Button } from "../../../../../../shared/components/Button/Button";

export function AdminHeaderDesktopView({
  churchName = "No Church",
  user,
  isSidebarCollapsed = false,
  onToggleSidebar,
  onLogout,
  isLoggingOut = false,
}: AdminHeaderDesktopViewProps) {
  return (
    <header className="relative z-30 flex w-full items-center justify-between border-b border-midnight-teal/10 bg-white/70 px-5 py-3.5 backdrop-blur-md lg:px-8">
      {/* Left Section: Burger Button + Name of Church */}
      <div className="flex items-center gap-4 min-w-0">
        {/* Burger Button with parallel state when minimized */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-midnight-teal/10 bg-white/80 p-0 text-midnight-teal shadow-2xs backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-midnight-teal hover:border-midnight-teal/25 active:scale-95 cursor-pointer"
        >
          <Menu
            className={`h-5 w-5 stroke-[2.2] transition-transform duration-300 ease-in-out ${
              isSidebarCollapsed ? "rotate-90" : "rotate-0"
            }`}
          />
        </Button>

        {/* Church Name (large, name only, primary color) */}
        <div className="flex items-center min-w-0">
          <span className="font-sans text-xl font-bold text-primary truncate tracking-tight">
            {churchName || "No Church"}
          </span>
        </div>
      </div>

      {/* Right Section: User Profile component */}
      <div className="flex items-center gap-3 shrink-0">
        <UserProfile
          user={user}
          onLogout={onLogout}
          isLoggingOut={isLoggingOut}
        />
      </div>
    </header>
  );
}

export default AdminHeaderDesktopView;
