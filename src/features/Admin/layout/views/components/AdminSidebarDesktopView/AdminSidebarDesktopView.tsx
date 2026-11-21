import { AdminSidebarItem } from "./AdminSidebarItem";
import type { AdminSidebarDesktopViewProps } from "../../../models/types/adminLayoutView.types";

export function AdminSidebarDesktopView({
  brand,
  items,
  isCollapsed = false,
  onExpand,
  className = "",
}: AdminSidebarDesktopViewProps) {
  return (
    <aside
      className={`admin-nav relative z-40 hidden lg:flex shrink-0 flex-col border-r border-midnight-teal/10 bg-white/85 backdrop-blur-2xl transition-all duration-300 ease-in-out h-full ${
        isCollapsed ? "w-20 px-2" : "w-64 px-4"
      } ${className}`.trim()}
    >
      {/* Brand Header */}
      {brand && (
        <div
          className={`border-b border-midnight-teal/10 py-5 flex items-center transition-all duration-200 ${
            isCollapsed ? "justify-center" : "gap-3 px-2"
          }`}
        >
          <img
            src={brand.logoSrc}
            alt={brand.logoAlt}
            className="h-9 w-9 object-contain shrink-0"
          />
          {!isCollapsed && (
            <span className="font-sans text-xl font-black tracking-widest text-midnight-teal truncate">
              {brand.name}
            </span>
          )}
        </div>
      )}

      {/* Navigation Items List */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-5 flex flex-col gap-1.5">
        {items.map((item) => (
          <AdminSidebarItem
            key={item.to}
            item={item}
            isCollapsed={isCollapsed}
            onExpand={onExpand}
          />
        ))}
      </nav>
    </aside>
  );
}

export default AdminSidebarDesktopView;
