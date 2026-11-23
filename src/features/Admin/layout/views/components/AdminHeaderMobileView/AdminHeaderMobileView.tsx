import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { DropDownNavmenu } from "./DropDownNavmenu";
import type { AdminHeaderMobileViewProps } from "../../../models/types/adminLayoutView.types";

export function AdminHeaderMobileView({
  churchName = "No Church",
  brand,
  items,
  user,
  onLogout,
  isLoggingOut = false,
}: AdminHeaderMobileViewProps) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(location.pathname);

  // Reset menu open state on route change during render
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setIsMenuOpen(false);
  }

  // Lock background scroll when mobile dropdown is open
  useEffect(() => {
    if (!isMenuOpen) return;

    const originalOverflow = document.body.style.overflow;
    const mainViewport = document.getElementById("admin-main-viewport");
    const originalMainOverflow = mainViewport?.style.overflow ?? "";

    document.body.style.overflow = "hidden";
    if (mainViewport) {
      mainViewport.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      if (mainViewport) {
        mainViewport.style.overflow = originalMainOverflow;
      }
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-[80] flex w-full flex-col border-b border-midnight-teal/10 bg-white lg:hidden">
      {/* Top Mobile Bar: Church Name + Burger Button */}
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6">
        {/* Church Name */}
        <div className="flex items-center min-w-0 pr-3">
          <span className="font-sans text-xl font-bold text-primary truncate tracking-tight">
            {churchName || "No Church"}
          </span>
        </div>

        {/* Burger Button with border and parallel transition when open */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-midnight-teal/20 bg-white/70 p-1.5 text-primary shadow-2xs backdrop-blur-sm transition-all duration-200 hover:border-midnight-teal/35 hover:bg-white hover:shadow-xs active:scale-95 cursor-pointer focus:outline-none"
        >
          <Menu
            className={`h-6 w-6 stroke-[2.3] transition-transform duration-300 ease-in-out ${
              isMenuOpen ? "rotate-90" : "rotate-0"
            }`}
          />
        </button>
      </div>

      {/* Dropdown Navigation Menu */}
      <DropDownNavmenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        brand={brand}
        user={user}
        items={items}
        onLogout={onLogout}
        isLoggingOut={isLoggingOut}
      />
    </header>
  );
}

export default AdminHeaderMobileView;
