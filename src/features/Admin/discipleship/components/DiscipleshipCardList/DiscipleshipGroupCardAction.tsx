import { MoreVertical } from "lucide-react";

export interface DiscipleshipGroupCardActionProps {
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}

export function DiscipleshipGroupCardAction({
  onClick,
  ariaLabel = "Group options",
  className = "",
}: DiscipleshipGroupCardActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-midnight-teal ${className}`.trim()}
    >
      <MoreVertical className="h-4 w-4" />
    </button>
  );
}

export default DiscipleshipGroupCardAction;
