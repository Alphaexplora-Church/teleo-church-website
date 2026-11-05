export type BadgeVariant = "success" | "neutral" | "warning" | "danger" | "primary";
export type BadgeSize = "sm" | "md";

export const baseBadgeStyle =
  "inline-flex items-center justify-center font-semibold rounded-full border transition-colors select-none";

export const variantStyle: Record<BadgeVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  neutral: "bg-slate-100 text-slate-700 border-slate-200/80",
  warning: "bg-amber-50 text-amber-800 border-amber-200/80",
  danger: "bg-rose-50 text-rose-700 border-rose-200/80",
  primary: "bg-midnight-teal/10 text-midnight-teal border-midnight-teal/20",
};

export const dotColorStyle: Record<BadgeVariant, string> = {
  success: "text-emerald-500",
  neutral: "text-slate-400",
  warning: "text-amber-500",
  danger: "text-rose-500",
  primary: "text-midnight-teal",
};

export const sizeStyle: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px] gap-1.5",
  md: "px-2.5 py-1 text-xs gap-1.5",
};

export const dotSizeStyle: Record<BadgeSize, string> = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
};

export const standaloneSizeStyle: Record<BadgeSize, string> = {
  sm: "p-1",
  md: "p-1.5",
};
