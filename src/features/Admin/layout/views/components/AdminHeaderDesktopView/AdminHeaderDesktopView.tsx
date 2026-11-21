import { Menu } from "lucide-react";
import type { AdminHeaderDesktopViewProps } from "../../../models/types/adminLayoutView.types";
import { UserProfile } from "../UserProfile/UserProfile";

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
      <div className="flex items-center gap-10 min-w-0">
        {/* Burger Button with border */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-midnight-teal/20 bg-white/60 p-1.5 text-primary shadow-2xs backdrop-blur-sm transition-all duration-200 hover:border-midnight-teal/35 hover:bg-white hover:shadow-xs active:scale-95 cursor-pointer focus:outline-none"
        >
          <Menu
            className={`h-6 w-6 stroke-[2.3] transition-transform duration-300 ease-in-out ${
              isSidebarCollapsed ? "rotate-90" : "rotate-0"
            }`}
          />
        </button>

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
