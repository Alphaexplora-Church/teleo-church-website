import { useLocation } from "react-router-dom";
import { NavLink } from "../NavLink/NavLink";

export interface AdminSidebarSubItem {
  to: string;
  label: string;
  count?: number;
}

export interface AdminSidebarItemData {
  to: string;
  label: string;
  subItems?: readonly AdminSidebarSubItem[];
  count?: number;
}

export interface AdminSidebarItemProps {
  item: AdminSidebarItemData;
}

export function AdminSidebarItem({ item }: AdminSidebarItemProps) {
  const location = useLocation();

  const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);

  // Checks if the user is currently on this route or any of its sub-routes
  const isSelfOrChildActive =
    location.pathname === item.to ||
    location.pathname.startsWith(`${item.to}/`);

  // Regular single NavLink when there are no sub-items
  if (!hasSubItems) {
    return (
      <NavLink
        to={item.to}
        className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 text-midnight-teal/65 hover:text-midnight-teal"
        activeClassName="bg-midnight-teal text-white shadow-lg shadow-midnight-teal/15 hover:bg-midnight-teal hover:text-white"
      >
        {item.label}
      </NavLink>
    );
  }

  // Parent item with sub-items: sub-items only appear when user is on discipleship
  return (
    <div className="flex flex-col">
      <NavLink
        to={item.to}
        end
        className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 text-midnight-teal/65 hover:text-midnight-teal"
        activeClassName="bg-midnight-teal text-white shadow-lg shadow-midnight-teal/15 hover:bg-midnight-teal hover:text-white"
      >
        {item.label}
      </NavLink>

      {/* Sub-items list only rendered when parent or child route is active */}
      {isSelfOrChildActive && item.subItems && (
        <div className="ml-4 mt-1 flex flex-col gap-1 border-l-2 border-midnight-teal/10 pl-3">
          {item.subItems.map((sub) => {
            const isSubActive =
              location.pathname === sub.to ||
              location.pathname.startsWith(`${sub.to}/`);

            return (
              <NavLink
                key={sub.to}
                to={sub.to}
                className="flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 text-midnight-teal/65 hover:text-midnight-teal"
                activeClassName="bg-midnight-teal text-white shadow-sm font-bold hover:bg-midnight-teal hover:text-white"
              >
                <span className="flex items-center gap-1.5">
                  <span>{sub.label}</span>
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
                </span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminSidebarItem;
