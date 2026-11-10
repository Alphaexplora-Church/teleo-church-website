import { Button } from "../../../../../shared/components/Button/Button";
import type {
  ApplicationChurchFilter,
  DiscipleshipApplicationFilterProps,
} from "../../models/types/discipleshipApplication.types";

export function DiscipleshipApplicationFilter({
  activeFilter,
  onFilterChange,
  counts,
  onOpenIntakeSchema,
  className = "",
}: DiscipleshipApplicationFilterProps) {
  const tabs: Array<{ id: ApplicationChurchFilter; label: string; count: number }> = [
    { id: "all", label: "All", count: counts.all },
    { id: "home_church", label: "Home Church", count: counts.homeChurch },
    { id: "other_churches", label: "Other Churches", count: counts.otherChurches },
  ];

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full ${className}`.trim()}
    >
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFilterChange(tab.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all select-none cursor-pointer ${
                isActive
                  ? "bg-primary text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          );
        })}
      </div>

      {/* Right-side Action Button: Intake Schema using shared Button without icon */}
      <Button
        variant="primary"
        size="sm"
        onClick={onOpenIntakeSchema}
        className="rounded-xl font-semibold !text-white shadow-xs transition-opacity hover:opacity-90 shrink-0 cursor-pointer"
      >
        Intake Schema
      </Button>
    </div>
  );
}

export default DiscipleshipApplicationFilter;
