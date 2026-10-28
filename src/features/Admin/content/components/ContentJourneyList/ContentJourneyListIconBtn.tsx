import type { ButtonHTMLAttributes } from "react";
import { MoreVertical } from "lucide-react";

export interface ContentJourneyListIconBtnProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  iconClassName?: string;
}

export function ContentJourneyListIconBtn({
  className = "",
  iconClassName = "h-4 w-4",
  type = "button",
  onClick,
  ...props
}: ContentJourneyListIconBtnProps) {
  return (
    <button
      type={type}
      aria-label="More options"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className={`w-9 h-9 rounded-full bg-white/95 shadow-sm flex items-center justify-center text-slate-700 hover:bg-white hover:shadow transition border border-slate-100 cursor-pointer ${className}`.trim()}
      {...props}
    >
      <MoreVertical className={iconClassName} />
    </button>
  );
}