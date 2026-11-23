import { Outlet } from "react-router-dom";
import { AdminHeaderDesktopView } from "./components/AdminHeaderDesktopView/AdminHeaderDesktopView";
import { AdminHeaderMobileView } from "./components/AdminHeaderMobileView/AdminHeaderMobileView";
import adminBg from "../../../../assets/admin-bg.jpg";
import { AdminSidebarDesktopView } from "./components/AdminSidebarDesktopView/AdminSidebarDesktopView";
import { ADMIN_BRAND } from "../models/constants/adminLayoutView.constants";
import { useAdminSidebarViewModel } from "../viewmodels/useAdminSidebarViewModel";
import { useAdminHeaderViewModel } from "../viewmodels/useAdminHeaderViewModel";

export default function AdminLayoutView() {
  const sidebarVm = useAdminSidebarViewModel();
  const headerVm = useAdminHeaderViewModel();

  return (
    <div
      className="relative flex h-screen w-screen overflow-hidden text-midnight-teal flex-col lg:flex-row"
      style={{
        background: `linear-gradient(135deg, rgba(235, 242, 239, 0.88), rgba(247, 244, 236, 0.94)), url(${adminBg}) center / cover fixed no-repeat`,
      }}
    >
      {/* Background Decor Layer */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(circle at 16% 10%, rgba(255, 255, 255, 0.38), transparent 28rem), linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(0, 46, 56, 0.08))",
        }}
      />

      {/* Mobile Header & Responsive DropDown Navmenu */}
      <AdminHeaderMobileView
        churchName={headerVm.churchName}
        brand={ADMIN_BRAND}
        items={sidebarVm.navLinks}
        user={headerVm.user}
        onLogout={headerVm.logout}
        isLoggingOut={headerVm.isLoggingOut}
      />

      {/* Desktop Sidebar (Collapsible with smooth transition) */}
      <AdminSidebarDesktopView
        brand={ADMIN_BRAND}
        items={sidebarVm.navLinks}
        isCollapsed={sidebarVm.isCollapsed}
        onExpand={sidebarVm.expand}
      />

      {/* Main Full-Width Column: Header + Viewport */}
      <div className="relative flex flex-1 flex-col overflow-hidden min-w-0">
        <AdminHeaderDesktopView
          churchName={headerVm.churchName}
          user={headerVm.user}
          isSidebarCollapsed={sidebarVm.isCollapsed}
          onToggleSidebar={sidebarVm.toggleCollapse}
          onLogout={headerVm.logout}
          isLoggingOut={headerVm.isLoggingOut}
        />

        <main
          id="admin-main-viewport"
          onClick={() => {
            if (!sidebarVm.isCollapsed) {
              sidebarVm.collapse();
            }
          }}
          className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 overscroll-contain p-4 sm:p-6 lg:p-8"
        >
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
