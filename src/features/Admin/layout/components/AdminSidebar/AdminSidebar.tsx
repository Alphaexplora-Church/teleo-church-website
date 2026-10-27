import { AdminSidebarItem, type AdminSidebarItemData } from "./AdminSidebarItem";

export type { AdminSidebarItemData, AdminSidebarSubItem } from "./AdminSidebarItem";

export interface AdminSidebarBrand {
  name: string;
  logoSrc: string;
  logoAlt: string;
}

export interface AdminSidebarProps {
  brand?: AdminSidebarBrand;
  items: AdminSidebarItemData[];
  className?: string;
}

export function AdminSidebar({
  brand,
  items,
  className = "",
}: AdminSidebarProps) {
  return (
    <aside
      className={`admin-nav relative z-40 flex w-full shrink-0 flex-col border-b border-midnight-teal/10 bg-white/80 px-5 backdrop-blur-2xl lg:h-full lg:self-stretch lg:w-64 lg:border-b-0 lg:border-r lg:px-6 ${className}`}
    >
      {brand && (
        <div className="border-b border-midnight-teal/10 py-6 flex items-center gap-3">
          <img
            src={brand.logoSrc}
            alt={brand.logoAlt}
            className="h-9 w-9 object-contain"
          />
          <span className="font-sans text-xl font-black tracking-widest text-midnight-teal">
            {brand.name}
          </span>
        </div>
      )}

      <nav className="flex gap-1 overflow-x-auto py-4 lg:flex-1 lg:flex-col lg:overflow-visible lg:py-8">
        {items.map((item) => (
          <AdminSidebarItem key={item.to} item={item} />
        ))}
      </nav>
    </aside>
  );
}

export default AdminSidebar;
