import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "../../../../../shared/components/Badge/Badge";
import { Button } from "../../../../../shared/components/Button/Button";
import { DiscipleshipApplicationDropdownGroup } from "./DiscipleshipApplicationDropdownGroup";
import type { DiscipleshipApplicationCollapsibleCardProps } from "../../models/types/discipleshipApplication.types";
import { getLowestRemainingCapacityGroupId } from "../../models/utils/discipleshipApplication.utils";

export function DiscipleshipApplicationCollapsibleCard({
  applicant,
  availableGroups,
  isExpanded,
  onToggleExpand,
  onApprove,
  onReject,
  className = "",
}: DiscipleshipApplicationCollapsibleCardProps) {
  const [userSelectedGroupId, setUserSelectedGroupId] = useState<string | null>(
    null,
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedGroupId =
    userSelectedGroupId ??
    applicant.assignedGroupId ??
    getLowestRemainingCapacityGroupId(availableGroups);

  const zIndexClass = isDropdownOpen
    ? "relative z-20"
    : isExpanded
      ? "relative z-10"
      : "relative z-0";

  return (
    <div
      className={`rounded-2xl border border-slate-200/90 bg-white shadow-2xs transition-all ${zIndexClass} ${className}`.trim()}
    >
      {/* 1. Header Summary (Clickable to toggle) */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={onToggleExpand}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggleExpand();
          }
        }}
        className="flex items-center justify-between p-4 cursor-pointer select-none transition-colors hover:bg-slate-50/50 sm:p-5"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Profile Avatar (plain grey circle with NO letters/initials if no image) */}
          {applicant.avatarUrl ? (
            <img
              src={applicant.avatarUrl}
              alt={applicant.name}
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
            />
          ) : (
            <div
              className="h-10 w-10 shrink-0 rounded-full bg-slate-200"
              aria-hidden="true"
            />
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-sans text-base font-bold text-slate-900 truncate">
                {applicant.name}
              </h3>

              {/* ONLY render badge if applicant is from HOME CHURCH (Green variant="success", micro/pill size) */}
              {applicant.isHomeChurch && (
                <Badge
                  variant="success"
                  size="sm"
                  className="shrink-0 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 border-emerald-500/30 text-emerald-600 bg-emerald-50/60 leading-none"
                >
                  HOME CHURCH
                </Badge>
              )}
            </div>

            <p className="mt-0.5 text-xs text-slate-500">
              {applicant.appliedRelativeTime}
            </p>
          </div>
        </div>

        {/* Chevron Icon */}
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200/70 ml-2">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </span>
      </div>

      {/* 2. Expandable Content: Questionnaire Answers & Action Footer (overflow-visible to prevent clipping popovers) */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="card-expanded-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-visible"
          >
            <div className="border-t border-slate-100 px-4 pt-4 pb-5 sm:px-5">
              {/* Questionnaire Q&A items using clean divide-y without redundant hr elements */}
              <div className="divide-y divide-slate-100">
                {applicant.answers.map((answer, index) => (
                  <div
                    key={answer.questionId || index}
                    className="py-2.5 first:pt-0 last:pb-0"
                  >
                    <p className="text-xs font-semibold text-slate-600">
                      {answer.questionText}
                    </p>
                    <p className="mt-1 text-sm font-medium italic text-slate-800 leading-relaxed">
                      “{answer.answerText.replace(/^“|”$/g, "")}”
                    </p>
                  </div>
                ))}
              </div>

              {/* Action Footer */}
              <div className="mt-5 flex flex-col gap-3 pt-4 border-t border-slate-100 sm:flex-row sm:items-center sm:justify-between">
                {/* Group Placement Dropdown (no label, popover floats over card) */}
                <DiscipleshipApplicationDropdownGroup
                  groups={availableGroups}
                  selectedGroupId={selectedGroupId}
                  onChange={setUserSelectedGroupId}
                  onOpenChange={setIsDropdownOpen}
                />

                {/* Action Buttons using shared Button component */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReject(applicant.id)}
                    className="rounded-xl border-slate-200 bg-white font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                  >
                    Reject
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!selectedGroupId}
                    onClick={() => onApprove(applicant.id, selectedGroupId)}
                    className="rounded-xl font-semibold !text-white shadow-xs hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Approve & Place
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DiscipleshipApplicationCollapsibleCard;
