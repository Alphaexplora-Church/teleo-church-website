export type DiscipleshipAvatarSize = "xs" | "sm" | "md" | "lg";

export const avatarSizeStyles: Record<DiscipleshipAvatarSize, string> = {
  xs: "h-6 w-6",
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-10 w-10",
};

export const avatarIconSizes: Record<DiscipleshipAvatarSize, string> = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4.5 w-4.5",
  lg: "h-5 w-5",
};

export const avatarBaseContainerStyle =
  "relative shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/80";

export const avatarFallbackStyle =
  "flex h-full w-full items-center justify-center bg-slate-100 text-slate-400";

