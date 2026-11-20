import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../../../../../shared/components/Button/Button";
import type { AdminSidebarItemProps } from "../../../models/types/adminLayoutView.types";

export function AdminSidebarItem({
  item,
  isCollapsed = false,
  onExpand,
}: AdminSidebarItemProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
  const Icon = item.icon;

  // Checks if the user is currently on this route or any of its sub-routes
  const isExactActive = location.pathname === item.to;
  const isChildActive = Boolean(
    item.subItems?.some(
      (sub) => location.pathname === sub.to || location.pathname.startsWith(`${sub.to}/`)
    )
  );
  const isActive = isExactActive || (!hasSubItems && location.pathname.startsWith(`${item.to}/`));
  const isSelfOrChildActive = isActive || isChildActive;

  // Handler for menu clicks: if minimized, auto-expand sidebar as requested
  const handleItemClick = () => {
    if (isCollapsed) {
      onExpand?.();
    }
    navigate(item.to);
  };

  // Minimized state (Icon only)
  if (isCollapsed) {
    return (
      <div className="flex justify-center w-full py-0.5">
        <Button
          type="button"
          variant={isActive ? "primary" : "ghost"}
          size="sm"
          title={item.label}
          onClick={handleItemClick}
          className={`h-11 w-11 p-0 rounded-xl justify-center transition-all duration-200 cursor-pointer ${
            isActive
              ? "!bg-primary !text-white shadow-md shadow-primary/25 hover:!bg-primary hover:!text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-primary"
          }`}
        >
          {Icon ? (
            <Icon className="h-5 w-5 shrink-0 stroke-[2]" />
          ) : (
            <span className="text-xs font-bold">{item.label[0]}</span>
          )}
        </Button>
      </div>
    );
  }

  // Expanded state: Regular single Button when there are no sub-items
  if (!hasSubItems) {
    return (
      <Button
        type="button"
        variant={isActive ? "primary" : "ghost"}
        size="md"
        onClick={handleItemClick}
        className={`w-full justify-start gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${
          isActive
            ? "!bg-primary !text-white shadow-md shadow-primary/25 hover:!bg-primary hover:!text-white"
            : "text-slate-700 hover:bg-slate-100/80 hover:text-primary"
        }`}
      >
        {Icon && <Icon className="h-4.5 w-4.5 shrink-0 stroke-[2]" />}
        <span className="truncate">{item.label}</span>
      </Button>
    );
  }

  // Expanded state: Parent item with sub-items
  return (
    <div className="flex flex-col">
      <Button
        type="button"
        variant={isActive ? "primary" : "ghost"}
        size="md"
        onClick={handleItemClick}
        className={`w-full justify-start gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${
          isActive
            ? "!bg-primary !text-white shadow-md shadow-primary/25 hover:!bg-primary hover:!text-white"
            : "text-slate-700 hover:bg-slate-100/80 hover:text-primary"
        }`}
      >
        {Icon && <Icon className="h-4.5 w-4.5 shrink-0 stroke-[2]" />}
        <span className="truncate">{item.label}</span>
      </Button>

      {/* Sub-items list only rendered when parent or child route is active */}
      {isSelfOrChildActive && item.subItems && (
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
                onClick={() => {
                  navigate(sub.to);
                }}
                className={`w-full justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isSubActive
                    ? "!bg-primary !text-white shadow-xs font-bold hover:!bg-primary hover:!text-white"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-primary"
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  {SubIcon && <SubIcon className="h-3.5 w-3.5 shrink-0 stroke-[2]" />}
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
}

export default AdminSidebarItem;
