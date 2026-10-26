import type { ReactNode } from "react";
import { ToggleSwitch } from "../../../../../shared/components/ToggleSwitch/ToggleSwitch";

export interface DiscipleshipModuleToggleProps {
  title?: ReactNode | ((checked: boolean) => ReactNode);
  checked: boolean;
  onChange: (checked: boolean) => void;
  toggleLabel?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function DiscipleshipModuleToggle({
  title,
  checked,
  onChange,
  toggleLabel,
  disabled = false,
  className = "",
}: DiscipleshipModuleToggleProps) {
  const dynamicTitle =
    typeof title === "function"
      ? title(checked)
      : (title ?? `${checked ? "Disable" : "Enable"} Discipleship Module`);

  return (
    <div
      className={`flex w-full items-center justify-between gap-4 rounded-2xl border border-midnight-teal/10 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-md ${className}`.trim()}
    >
      <h3 className="text-base font-bold tracking-tight text-midnight-teal">
        {dynamicTitle}
      </h3>

      <ToggleSwitch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      >
        {toggleLabel}
      </ToggleSwitch>
    </div>
  );
}

export default DiscipleshipModuleToggle;
