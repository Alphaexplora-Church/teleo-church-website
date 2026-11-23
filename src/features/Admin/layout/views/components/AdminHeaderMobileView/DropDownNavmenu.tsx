import { AnimatePresence, motion } from "framer-motion";
import { LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../../../../../shared/components/Button/Button";
import type { DropDownNavmenuProps } from "../../../models/types/adminLayoutView.types";
import { isNavItemActive } from "../../../models/utils/adminLayout.utils";

export function DropDownNavmenu({
  isOpen,
  onClose,
  brand,
  user,
  items,
  onLogout,
  isLoggingOut = false,
}: DropDownNavmenuProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const displayName = user?.username || user?.email?.split("@")[0] || "Admin";
  const avatarUrl = user?.profile_picture_url;
  const email = user?.email || "";

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. Blurred Backdrop Overlay covering everything underneath the header */}
          <motion.div
            key="mobile-navmenu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-x-0 bottom-0 top-16 z-[60] bg-black/40 backdrop-blur-md cursor-pointer"
          />

          {/* 2. Dropdown Navigation Menu Card - Solid White */}
          <motion.div
            key="mobile-navmenu-dropdown"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-x-0 top-16 z-[70] max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-b-3xl border-b border-midnight-teal/15 bg-white shadow-2xl overscroll-contain"
          >
            <div className="flex flex-col gap-4 bg-white px-4 py-5">
              {/* Teleo Logo Section */}
              {brand && (
                <div className="flex items-center gap-3 px-2 pb-2 border-b border-midnight-teal/10">
                  <img
                    src={brand.logoSrc}
                    alt={brand.logoAlt}
                    className="h-8 w-8 object-contain shrink-0"
                  />
                  <span className="font-sans text-xl font-black tracking-widest text-midnight-teal">
                    {brand.name}
                  </span>
                </div>
              )}

              {/* User Profile Section (Avatar + Name, fallback to gray skeleton circle) */}
              <button
                type="button"
                onClick={() => handleNavigate("/admin/settings")}
                className="flex items-center gap-3 rounded-2xl border border-midnight-teal/10 bg-slate-50 p-3 text-left shadow-2xs transition-all hover:bg-slate-100 hover:border-midnight-teal/25 cursor-pointer focus:outline-none"
              >
                {avatarUrl && !imageError ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    onError={() => setImageError(true)}
                    className="h-10 w-10 rounded-full object-cover ring-1 ring-midnight-teal/10 shrink-0"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-500 shadow-inner shrink-0">
                    <UserIcon className="h-5 w-5" />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="font-sans text-sm font-bold text-midnight-teal truncate">
                    {displayName}
                  </span>
                  {email && (
                    <span className="font-sans text-xs text-midnight-teal/60 truncate">
                      {email}
                    </span>
                  )}
                </div>
              </button>

              {/* Navigation Menu Items List */}
              <nav className="flex flex-col gap-1.5 pt-1">
                {items.map((item) => {
                  const { isActive, isSelfOrChildActive } = isNavItemActive(
                    location.pathname,
                    item
                  );
                  const Icon = item.icon;
                  const hasSubItems = Boolean(
                    item.subItems && item.subItems.length > 0
                  );

                  return (
                    <div key={item.to} className="flex flex-col">
                      <Button
                        type="button"
                        variant={isActive ? "primary" : "ghost"}
                        size="md"
                        onClick={() => handleNavigate(item.to)}
                        className={`w-full justify-start gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "!bg-primary !text-white shadow-md shadow-primary/25 hover:!bg-primary hover:!text-white"
                            : "text-slate-700 hover:bg-slate-100/80 hover:text-primary"
                        }`}
                      >
                        {Icon && (
                          <Icon className="h-4.5 w-4.5 shrink-0 stroke-[2]" />
                        )}
                        <span className="truncate">{item.label}</span>
                      </Button>

                      {/* Submenu for items with subItems (e.g. Discipleship -> Application) */}
                      {hasSubItems && isSelfOrChildActive && item.subItems && (
                        <div className="ml-5 mt-1 flex flex-col gap-1 border-l-2 border-slate-200 pl-3">
                          {item.subItems.map((sub) => {
                            const isSubActive =
                              location.pathname === sub.to ||
                              location.pathname.startsWith(`${sub.to}/`);
                            const SubIcon = sub.icon;

                            return (
                              <Button
                                key={sub.to}
                                type="button"
                                variant={isSubActive ? "primary" : "ghost"}
                                size="sm"
                                onClick={() => handleNavigate(sub.to)}
                                className={`w-full justify-between rounded-lg px-2.5 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                                  isSubActive
                                    ? "!bg-primary !text-white shadow-xs font-bold hover:!bg-primary hover:!text-white"
                                    : "text-slate-600 hover:bg-slate-100/80 hover:text-primary"
                                }`}
                              >
                                <span className="flex items-center gap-2 truncate">
                                  {SubIcon && (
                                    <SubIcon className="h-3.5 w-3.5 shrink-0 stroke-[2]" />
                                  )}
                                  <span className="truncate">{sub.label}</span>
                                </span>
                                {typeof sub.count === "number" && (
                                  <span
                                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none ${
                                      isSubActive
                                        ? "bg-white/20 text-white"
                                        : "bg-slate-200 text-slate-700"
                                    }`}
                                  >
                                    {sub.count}
                                  </span>
                                )}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* Logout Action at the Bottom */}
              <div className="pt-2 border-t border-midnight-teal/10">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  disabled={isLoggingOut}
                  onClick={() => {
                    onClose();
                    void onLogout?.();
                  }}
                  className="w-full justify-start gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer"
                >
                  <LogOut className="h-4.5 w-4.5 shrink-0 stroke-[2.2] text-red-500" />
                  <span>{isLoggingOut ? "Signing out..." : "Logout"}</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default DropDownNavmenu;

