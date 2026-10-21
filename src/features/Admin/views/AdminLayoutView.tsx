import { Outlet } from "react-router-dom";
import AdminSidebar from "../../../shared/components/AdminSidebar";
import AdminHeader from "../../../shared/components/AdminHeader";

export default function AdminLayoutView() {
  return (
    <div className="admin-shell flex flex-col lg:flex-row">
      {/* Persistent Sidebar: Hindi magre-remount sa page switch */}
      <AdminSidebar />

      {/* Main Container Shell */}
      <div className="relative flex flex-1 flex-col overflow-hidden min-w-0">
        <AdminHeader />

        {/* Scrollable Viewport kung saan lalabas ang child screens */}
        <main
          id="admin-main-viewport"
          className="admin-main flex-1 overflow-y-auto min-h-0 overscroll-contain p-4 lg:p-6"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
