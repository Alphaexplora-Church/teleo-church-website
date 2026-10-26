import { Outlet } from "react-router-dom";
import AdminHeader from "../components/AdminHeader/AdminHeader";
import adminBg from "../../../../assets/admin-bg.jpg";
import { AdminSidebar } from "../components/AdminSidebar/AdminSidebar";
import { ADMIN_BRAND } from "../models/constants/adminLayoutView.constants";
import { useAdminSidebarViewModel } from "../viewmodels/useAdminSidebarViewModel";

export default function AdminLayoutView() {
  const vm = useAdminSidebarViewModel();

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#d9dfdd] flex items-center justify-center p-0 lg:p-4">
      {/* Background Decor Layer */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(circle at 16% 10%, rgba(255, 255, 255, 0.38), transparent 28rem), linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(0, 46, 56, 0.08))",
        }}
      />

      {/* Main Admin Shell Frame */}
      <div
        className="relative isolate flex flex-col lg:flex-row w-full lg:max-w-[1500px] h-full lg:h-[calc(100vh-2rem)] overflow-hidden lg:rounded-[2rem] border-0 lg:border lg:border-white/60 text-midnight-teal"
        style={{
          background: `linear-gradient(135deg, rgba(235, 242, 239, 0.84), rgba(247, 244, 236, 0.9)), url(${adminBg}) center / cover fixed no-repeat`,
          boxShadow: "0 2rem 6rem rgba(0, 46, 56, 0.18)",
        }}
      >
        <AdminSidebar brand={ADMIN_BRAND} items={vm.navLinks} />

        {/* Main Container Shell */}
        <div className="relative flex flex-1 flex-col overflow-hidden min-w-0">
          <AdminHeader />

          <main
            id="admin-main-viewport"
            className="flex-1 overflow-y-auto min-h-0 overscroll-contain p-4 lg:p-6"
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
