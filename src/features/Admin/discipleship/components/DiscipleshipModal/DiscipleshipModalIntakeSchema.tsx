import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleHelp, GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "../../../../../shared/components/Button/Button";
import type {
  DiscipleshipModalIntakeSchemaProps,
  IntakeQuestion,
} from "../../models/types/discipleshipApplication.types";
import {
  DISCIPLESHIP_APPLICATIONS_EMPTY_STATES,
  MAX_INTAKE_QUESTIONS,
  MAX_QUESTION_CHARS,
} from "../../models/constants/discipleshipApplication.constants";

function IntakeSchemaModalContent({
  onClose,
  questions: initialQuestions,
  onSaveSchema,
  isLoading = false,
}: Omit<DiscipleshipModalIntakeSchemaProps, "isOpen">) {
  const [questions, setQuestions] = useState<IntakeQuestion[]>(initialQuestions ?? []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Lock background scroll while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleStartEdit = (q: IntakeQuestion) => {
    setEditingId(q.id);
    setEditTitle(q.title);
    setIsAdding(false);
  };

  const handleSaveEdit = (id: string) => {
    const trimmed = editTitle.trim();
    if (!trimmed) return;
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, title: trimmed.slice(0, MAX_QUESTION_CHARS) } : q,
      ),
    );
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleAddQuestion = () => {
    const trimmed = newTitle.trim();
    if (!trimmed || questions.length >= 5) return;
    const newQuestion: IntakeQuestion = {
      id: `q-${Date.now()}`,
      title: trimmed.slice(0, MAX_QUESTION_CHARS),
      isRequired: true,
    };
    setQuestions((prev) => [...prev, newQuestion]);
    setNewTitle("");
    setIsAdding(false);
  };

  const isSaveDisabled = questions.length === 0 || isLoading;

  const handleSave = async () => {
    if (isSaveDisabled) return;
    await onSaveSchema(questions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-primary/40 backdrop-blur-xs"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col rounded-3xl border border-slate-100 bg-white p-5 shadow-2xl shadow-primary/10 sm:max-h-[calc(100dvh-3rem)] sm:p-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
          <div>
            <h2 className="font-sans text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              Edit Intake Questions
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Application questionnaire questions (max {MAX_INTAKE_QUESTIONS})
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Question List Area */}
        <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
          {questions.map((question, index) => {
            const isBeingEdited = editingId === question.id;

            if (isBeingEdited) {
              return (
                <div
                  key={question.id}
                  className="rounded-2xl border-2 border-primary/30 bg-primary/[0.02] p-3.5 shadow-2xs space-y-2"
                >
                  <span className="block text-[10px] font-bold tracking-wider uppercase text-primary">
                    QUESTION {index + 1}
                  </span>

                  <textarea
                    rows={2}
                    maxLength={MAX_QUESTION_CHARS}
                    value={editTitle}
                    onChange={(e) =>
                      setEditTitle(e.target.value.slice(0, MAX_QUESTION_CHARS))
                    }
                    placeholder="Enter question text..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                    autoFocus
                  />

                  {/* Character Counter & Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-400 self-end">
                      {editTitle.length}/{MAX_QUESTION_CHARS}
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(null)}
                        className="rounded-xl border-slate-200 bg-white font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={!editTitle.trim()}
                        onClick={() => handleSaveEdit(question.id)}
                        className="rounded-xl font-semibold !text-white shadow-xs hover:opacity-90 disabled:opacity-40 cursor-pointer"
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={question.id}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs transition-colors hover:border-slate-300"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <GripVertical className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500 cursor-grab" />

                  <div className="min-w-0">
                    <span className="block font-sans text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      QUESTION {index + 1}
                    </span>
                    <p className="mt-0.5 font-sans text-sm font-semibold text-slate-800 truncate">
                      {question.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(question)}
                    aria-label={`Edit Question ${index + 1}`}
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(question.id)}
                    aria-label={`Delete Question ${index + 1}`}
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Empty State Prompt when no questions exist */}
          {questions.length === 0 && !isAdding && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-7 px-4 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-2xs border border-slate-100 text-slate-400 mb-2.5">
                <CircleHelp className="h-5 w-5 stroke-[1.5]" />
              </div>
              <p className="font-sans text-sm font-semibold text-slate-700">
                {DISCIPLESHIP_APPLICATIONS_EMPTY_STATES.emptyIntakeQuestionsTitle}
              </p>
              <p className="mt-1 max-w-xs text-xs text-slate-400">
                {DISCIPLESHIP_APPLICATIONS_EMPTY_STATES.emptyIntakeQuestionsDescription}
              </p>
            </div>
          )}

          {/* Inline Add Question Form */}
          {isAdding ? (
            <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-slate-50/60 p-3.5 space-y-2">
              <span className="block text-[10px] font-bold tracking-wider uppercase text-primary">
                NEW QUESTION ({questions.length + 1} / 5)
              </span>

              <textarea
                rows={2}
                maxLength={MAX_QUESTION_CHARS}
                value={newTitle}
                onChange={(e) =>
                  setNewTitle(e.target.value.slice(0, MAX_QUESTION_CHARS))
                }
                placeholder="Enter questionnaire question..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                autoFocus
              />

              {/* Character Counter & Actions */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400 self-end">
                  {newTitle.length}/{MAX_QUESTION_CHARS}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAdding(false);
                      setNewTitle("");
                    }}
                    className="rounded-xl border-slate-200 bg-white font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={!newTitle.trim()}
                    onClick={handleAddQuestion}
                    className="rounded-xl font-semibold !text-white shadow-xs hover:opacity-90 disabled:opacity-40 cursor-pointer"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* + Add Question (X / 5 used) Button */
            <button
              type="button"
              disabled={questions.length >= 5}
              onClick={() => setIsAdding(true)}
              className="w-full rounded-2xl border-2 border-dashed border-slate-200 py-3.5 text-center text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50/70 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none"
            >
              <Plus className="h-4 w-4" />
              <span>
                Add Question ({questions.length} / 5 used)
              </span>
            </button>
          )}
        </div>

        {/* Footer Actions using shared Button */}
        <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl border-slate-200 bg-white font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
          >
            Close
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="rounded-xl font-semibold !text-white shadow-xs hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? "Saving..." : "Save Schema"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export function DiscipleshipModalIntakeSchema(
  props: DiscipleshipModalIntakeSchemaProps,
) {
  return (
    <AnimatePresence>
      {props.isOpen && (
        <IntakeSchemaModalContent key="intake-schema-modal-content" {...props} />
      )}
    </AnimatePresence>
  );
}

export default DiscipleshipModalIntakeSchema;
