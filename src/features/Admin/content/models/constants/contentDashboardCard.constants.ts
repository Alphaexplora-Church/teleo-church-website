export interface ContentDashboardStatConfig {
  key: "total" | "published" | "draft";
  label: string;
  accent?: boolean;
}

/**
 * Standard configuration for the Content Dashboard overview KPI cards.
 */
export const CONTENT_DASHBOARD_STAT_CONFIGS: readonly ContentDashboardStatConfig[] = [
  {
    key: "total",
    label: "Total journeys",
    accent: false,
  },
  {
    key: "published",
    label: "Published",
    accent: true,
  },
  {
    key: "draft",
    label: "Drafts",
    accent: false,
  },
] as const;

/**
 * Helper utility to map counts into stat card items based on standard configs.
 */
export function createContentDashboardStats(counts: {
  total: number;
  published: number;
  draft: number;
}) {
  return CONTENT_DASHBOARD_STAT_CONFIGS.map((config) => ({
    key: config.key,
    label: config.label,
    accent: Boolean(config.accent),
    value: counts[config.key] ?? 0,
  }));
}
