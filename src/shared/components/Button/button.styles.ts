export type ButtonVariant = "primary" | "secondary" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export const variantStyle: Record<ButtonVariant, string> = {
  primary: "bg-primary text-secondary",
  secondary: "bg-secondary text-primary",
  outline: "border-2",
};

export const sizeStyle: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5",
  md: "px-5 py-2.5",
  lg: "px-6 py-3",
};

export const baseStyle = "inline-flex items-center justify-center gap-1.5";
