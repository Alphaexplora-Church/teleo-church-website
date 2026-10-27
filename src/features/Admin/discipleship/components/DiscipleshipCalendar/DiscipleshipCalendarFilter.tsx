import { motion } from "framer-motion";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Users } from "lucide-react";
import {
  Dropdown,
  DropdownDivider,
  DropdownHeader,
} from "../../../../../shared/components/Dropdown/Dropdown";
import { dropdownItemVariants } from "../../../../../shared/components/Dropdown/dropdown.animations";
import { DISCIPLESHIP_CALENDAR_UI } from "../../models/constants/discipleshipCalendar.constants";
import type { DiscipleshipCalendarFilterProps } from "../../models/types/discipleshipCalendar.types";

export function DiscipleshipCalendarFilter({
  formattedWeekRange,
  onPrevWeek,
  onNextWeek,
  onResetToday,
  isCurrentWeek,
  leaders = [],
  selectedLeaders,
  onLeaderToggle,
  onClearLeaders,
  className = "",
}: DiscipleshipCalendarFilterProps) {
  const selectedCount = selectedLeaders.length;
  const totalLeadersCount = leaders.length;

  return (
    <div
      className={`relative z-30 flex flex-col gap-3 md:flex-row md:items-center md:justify-between w-full ${className}`.trim()}
    >
      {/* Date Range Navigation (Left on desktop / Top on mobile) */}
      <div className="w-full flex items-center justify-between gap-2 md:w-auto">
        <div className="flex flex-1 items-center justify-between gap-1.5 rounded-2xl border border-primary/10 bg-white/90 p-1 shadow-2xs backdrop-blur-md md:flex-initial md:w-auto">
          <button
            type="button"
            onClick={onPrevWeek}
            aria-label="Previous week"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl text-primary/70 transition-colors hover:bg-primary/5 hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="flex-1 px-2 text-center font-sans text-sm font-bold tracking-tight text-primary select-none md:flex-initial md:min-w-[170px]">
            {formattedWeekRange}
          </span>

          <button
            type="button"
            onClick={onNextWeek}
            aria-label="Next week"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl text-primary/70 transition-colors hover:bg-primary/5 hover:text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Subtle "Today" reset button */}
        {!isCurrentWeek && (
          <button
            type="button"
            onClick={onResetToday}
            className="shrink-0 cursor-pointer rounded-xl border border-secondary/20 bg-secondary/5 px-2.5 py-1.5 text-xs font-semibold text-secondary transition-colors hover:bg-secondary/10"
          >
            Today
          </button>
        )}
      </div>

      {/* Leader Multi-Select Filter (Right on desktop / Bottom on mobile) */}
      <Dropdown
        align="right"
        width="w-full sm:w-72"
        className="w-full md:w-auto"
        trigger={(isOpen) => (
          <button
            type="button"
            className={`flex h-full min-h-11 w-full shrink-0 cursor-pointer items-center justify-between gap-2.5 rounded-2xl border border-primary/10 bg-white/90 px-4 py-2.5 text-sm font-semibold text-primary shadow-2xs backdrop-blur-md transition-all select-none hover:border-primary/20 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 md:w-auto md:min-w-[10rem] ${
              selectedCount > 0
                ? "border-primary bg-primary text-white hover:bg-primary/90"
                : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <Users
                className={`h-4 w-4 shrink-0 ${
                  selectedCount > 0 ? "text-white" : "text-primary/60"
                }`}
              />
              <span>
                {selectedCount > 0
                  ? `Leaders (${selectedCount})`
                  : totalLeadersCount > 0
                    ? `All Leaders (${totalLeadersCount})`
                    : "All Leaders"}
              </span>
            </div>

            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                selectedCount > 0 ? "text-white" : "text-primary/50"
              } ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        )}
      >
        <div className="flex flex-col p-1">
          {/* Popover Header with Clear Option */}
          <div className="flex items-center justify-between px-2 pt-1 pb-1.5">
            <DropdownHeader className="px-0 py-0 text-primary/60">
              {DISCIPLESHIP_CALENDAR_UI.filterHeader}
            </DropdownHeader>

            {selectedCount > 0 && (
              <button
                type="button"
                onClick={onClearLeaders}
                className="cursor-pointer text-xs font-semibold text-primary/70 underline transition-colors hover:text-primary"
              >
                Clear ({selectedCount})
              </button>
            )}
          </div>

          <DropdownDivider className="my-1" />

          {/* Checklist of Leaders */}
          <ul className="m-0 flex max-h-64 flex-col gap-0.5 overflow-y-auto p-0 list-none">
            {leaders.map((leader) => {
              const isChecked = selectedLeaders.includes(leader.name);

              return (
                <motion.li
                  key={leader.id}
                  variants={dropdownItemVariants}
                  className="list-none"
                >
                  <button
                    type="button"
                    onClick={() => onLeaderToggle(leader.name)}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-primary/5"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-slate-200 ring-1 ring-slate-300/40">
                        {leader.imageUrl ? (
                          <img
                            src={leader.imageUrl}
                            alt={leader.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-200 text-[10px] font-bold text-slate-600">
                            {leader.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                        )}
                      </div>

                      <span className="truncate text-sm font-medium text-primary">
                        {leader.name}
                      </span>
                    </div>

                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        isChecked
                          ? "border-primary bg-primary text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </Dropdown>
    </div>
  );
}

export default DiscipleshipCalendarFilter;
