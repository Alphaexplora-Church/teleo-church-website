import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, MessageSquareText, X } from "lucide-react";
import { Button } from "../../../../../shared/components/Button/Button";
import { Badge } from "../../../../../shared/components/Badge/Badge";

export interface ActiveDiscussionPrompt {
  id?: string | number;
  text: string;
  postedAt?: string;
  status?: string;
}

export interface DiscipleshipModalDiscussionPromptProps {
  isOpen: boolean;
  onClose: () => void;
  activePrompt?: ActiveDiscussionPrompt | null;
  onSubmit?: (promptText: string) => void | Promise<void>;
  isLoading?: boolean;
  maxLength?: number;
  minLength?: number;
}

function DiscussionPromptModalContent({
  onClose,
  activePrompt = null,
  onSubmit,
  isLoading = false,
  maxLength = 450,
  minLength = 1,
}: Omit<DiscipleshipModalDiscussionPromptProps, "isOpen">) {
  const [internalPrompt, setInternalPrompt] = useState<ActiveDiscussionPrompt | null>(null);
  const currentPrompt = activePrompt ?? internalPrompt;
  const [promptText, setPromptText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea height as user types without truncating

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(100, textareaRef.current.scrollHeight)}px`;
    }
  }, [promptText]);

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

  const trimmedText = promptText.trim();
  const isSubmitDisabled = trimmedText.length < minLength || isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    const formattedText =
      trimmedText.startsWith("“") || trimmedText.startsWith('"')
        ? trimmedText
        : `“${trimmedText}”`;

    const newPrompt: ActiveDiscussionPrompt = {
      id: Date.now().toString(),
      text: formattedText,
      postedAt: "Posted just now",
      status: "ACTIVE",
    };

    setInternalPrompt(newPrompt);
    setPromptText("");
    await onSubmit?.(trimmedText);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= maxLength) {
      setPromptText(val);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop Overlay */}
      <motion.div
        key="prompt-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-midnight-teal/40 backdrop-blur-xs"
      />

      {/* Modal Container */}
      <motion.div
        key="prompt-modal-panel"
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-y-auto rounded-3xl border border-slate-100 bg-white p-5 shadow-2xl shadow-midnight-teal/15 sm:max-h-[calc(100dvh-2.5rem)] sm:p-7"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-sans text-lg font-bold tracking-tight text-midnight-teal sm:text-xl">
            Discussion Prompts
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-midnight-teal focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-5 space-y-6">
          {/* Active Prompt Card vs Empty State */}
          <div className="space-y-2.5">
            {currentPrompt ? (
              <motion.div
                key="active-prompt-card"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2.5"
              >
                <div>
                  <Badge
                    dot
                    variant="success"
                    size="sm"
                    className="font-bold uppercase tracking-wider text-[10px] sm:text-[11px]"
                  >
                    {currentPrompt.status || "ACTIVE"}
                  </Badge>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-2xs sm:p-5">
                  <p className="whitespace-pre-wrap break-words font-sans text-sm font-medium leading-relaxed text-slate-800 sm:text-base">
                    {currentPrompt.text}
                  </p>

                  {currentPrompt.postedAt && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{currentPrompt.postedAt}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-prompt-card"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2.5"
              >
                <div>
                  <Badge
                    dot={false}
                    variant="neutral"
                    size="sm"
                    className="font-bold uppercase tracking-wider text-[10px] text-slate-500 sm:text-[11px]"
                  >
                    NO ACTIVE PROMPT
                  </Badge>
                </div>

                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center sm:px-6 sm:py-9">
                  <MessageSquareText className="h-7 w-7 text-slate-400/90 stroke-[1.6]" />
                  <h3 className="mt-2.5 font-sans text-sm font-semibold text-slate-800 sm:text-base">
                    No active prompt yet
                  </h3>
                  <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500 sm:max-w-sm sm:text-sm">
                    Post a question below to start a discussion across your discipleship groups.
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* New Discussion Prompt Section */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="new-discussion-prompt-input"
                className="block text-sm font-semibold text-slate-800"
              >
                New Discussion Prompt
              </label>

              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs transition-all focus-within:border-midnight-teal/40 focus-within:ring-2 focus-within:ring-midnight-teal/10 sm:p-4">
                <textarea
                  id="new-discussion-prompt-input"
                  ref={textareaRef}
                  value={promptText}
                  onChange={handleTextChange}
                  placeholder="Type your discipleship question or scriptural reflection prompt here..."
                  rows={4}
                  className="w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-midnight-teal placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:text-base"
                />
              </div>
            </div>

            {/* Footer with Character Counter & Submit Button */}
            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs font-normal text-slate-400">
                {promptText.length} / {maxLength} characters
              </span>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitDisabled}
                className="w-full rounded-xl font-semibold !text-white shadow-xs transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                {isLoading ? "Posting..." : "Post New Question"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export function DiscipleshipModalDiscussionPrompt(
  props: DiscipleshipModalDiscussionPromptProps,
) {
  return (
    <AnimatePresence>
      {props.isOpen && (
        <DiscussionPromptModalContent
          key="discussion-prompt-modal-content"
          {...props}
        />
      )}
    </AnimatePresence>
  );
}

export default DiscipleshipModalDiscussionPrompt;