export interface ContentDashboardCardProps {
  label: string;
  value: number | string;
  accent?: boolean;
  className?: string;
  isLoading?: boolean;
}

export interface ContentDashboardStatItem {
  key?: string;
  label: string;
  value: number | string;
  accent?: boolean;
}

export interface ContentDashboardCardGridProps {
  items: ContentDashboardStatItem[];
  className?: string;
  isLoading?: boolean;
}

/**
 * Reusable KPI stat card for the Content / Journeys dashboard.
 */
export function ContentDashboardCard({
  label,
  value,
  accent = false,
  className = "",
  isLoading = false,
}: ContentDashboardCardProps) {
  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-xs transition-shadow hover:shadow-sm w-full ${className}`.trim()}
    >
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-400 select-none">
        {label}
      </p>

      {isLoading ? (
        <div className="mt-1 h-9 w-16 animate-pulse rounded-md bg-slate-100" />
      ) : (
        <p
          className={`font-serif text-2xl sm:text-3xl font-medium tracking-tight ${
            accent ? "text-harvest-orange" : "text-primary"
          }`}
        >
          {value}
        </p>
      )}
    </div>
  );
}

/**
 * Optional layout grid wrapper to render multiple ContentDashboardCards via map.
 */
export function ContentDashboardCardGrid({
  items,
  className = "",
  isLoading = false,
}: ContentDashboardCardGridProps) {
  return (
    <section
      className={`grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full ${className}`.trim()}
      aria-label="Content overview statistics"
    >
      {items.map((item, index) => (
        <ContentDashboardCard
          key={item.key ?? item.label ?? index}
          label={item.label}
          value={item.value}
          accent={item.accent}
          isLoading={isLoading}
        />
      ))}
    </section>
  );
}

export default ContentDashboardCard;