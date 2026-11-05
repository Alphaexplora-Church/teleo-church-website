import { useState, useEffect, useMemo, type KeyboardEvent } from "react";
import { ChevronDown, X } from "lucide-react";
import { TabSwitch } from "../../../../../shared/components/TabSwitch/TabSwitch";
import {
  Dropdown,
  type DropdownOption,
} from "../../../../../shared/components/Dropdown/Dropdown";
import {
  EMPTY_PART_FORM,
  PART_CONTENT_TYPE_TABS,
  PART_STATUS_DROPDOWN_OPTIONS,
} from "../../models/constants/adminContent.constants";
import type {
  JourneyPart,
  PartContentType,
  PartFormData,
  PartStatus,
  VideoPreview,
} from "../../models/types/adminContent.types";
import { isYouTubeUrl, validateYouTubeUrl } from "../../models/api/youtube.api";

// ─── Sub-Component: Content Type Tabs ────────────────────────────────────────
interface SwitchTabProps {
  activeTab: PartContentType;
  onChange: (tab: PartContentType) => void;
}

function SwitchTab({ activeTab, onChange }: SwitchTabProps) {
  return (
    <TabSwitch
      tabs={PART_CONTENT_TYPE_TABS}
      activeTab={activeTab}
      onChange={onChange}
      layoutId="add-parts-modal-active-pill"
      fullWidth={true}
      containerClassName="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl"
      activePillClassName="bg-slate-900 rounded-lg shadow-xs"
      activeTextClassName="text-white hover:text-white font-semibold text-xs"
      inactiveTextClassName="text-slate-600 hover:text-slate-900 font-medium text-xs hover:bg-transparent"
      buttonClassName="rounded-lg h-9 px-2 sm:px-3.5 text-xs border-0 shadow-none"
    />
  );
}

// ─── Sub-Component: Part Status Dropdown ─────────────────────────────────────
interface StatusDropdownProps {
  value: PartStatus;
  onChange: (status: PartStatus) => void;
  disabled?: boolean;
  placement?: "bottom" | "top";
}

function StatusDropdown({
  value,
  onChange,
  disabled = false,
  placement = "top",
}: StatusDropdownProps) {
  const selectedLabel = useMemo(() => {
    const match = PART_STATUS_DROPDOWN_OPTIONS.find((opt) => opt.value === value);
    return match ? match.label : "Select status";
  }, [value]);

  const dropdownItems = useMemo<DropdownOption<PartStatus>[]>(() => {
    return PART_STATUS_DROPDOWN_OPTIONS.map((opt) => ({
      id: opt.value,
      label: (
        <span
          className={
            opt.value === value
              ? "font-bold text-slate-900"
              : "font-medium text-slate-700"
          }
        >
          {opt.label}
        </span>
      ),
      onClick: () => onChange(opt.value),
    }));
  }, [value, onChange]);

  return (
    <Dropdown
      items={dropdownItems}
      closeOnSelect={true}
      placement={placement}
      width="w-full"
      menuClassName="rounded-xl border border-slate-200/80 bg-white shadow-xl py-1.5"
      className="w-full"
      trigger={(isOpen) => (
        <button
          type="button"
          disabled={disabled}
          className="flex h-[42px] w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-2xs transition-all hover:border-slate-300 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 select-none cursor-pointer"
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 stroke-[2] text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      )}
    />
  );
}

// ─── Sub-Component: Video Link Input & Validator ─────────────────────────────
interface VideoLinkValidateProps {
  videoUrl: string;
  onChangeVideoUrl: (url: string) => void;
  preview: VideoPreview | null;
  onPreviewChange: (preview: VideoPreview | null) => void;
  disabled?: boolean;
}

function VideoLinkValidate({
  videoUrl,
  onChangeVideoUrl,
  preview,
  onPreviewChange,
  disabled = false,
}: VideoLinkValidateProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleValidate = async () => {
    const trimmed = videoUrl.trim();
    if (!trimmed || !isYouTubeUrl(trimmed)) {
      setErrorMessage("Invalid YouTube video URL");
      onPreviewChange(null);
      return;
    }

    setIsValidating(true);
    setErrorMessage(null);

    try {
      const result = await validateYouTubeUrl(trimmed);
      if (result) {
        onPreviewChange(result);
        setErrorMessage(null);
      } else {
        setErrorMessage("Could not load YouTube video preview.");
      }
    } catch {
      setErrorMessage("Failed to validate YouTube URL.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleValidate();
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => {
            onChangeVideoUrl(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled || isValidating}
          placeholder="Paste YouTube link..."
          className="w-full flex-1 h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition disabled:bg-slate-50 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={() => void handleValidate()}
          disabled={disabled || isValidating || !videoUrl.trim()}
          className="w-full sm:w-auto h-[42px] px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shrink-0 transition cursor-pointer select-none disabled:bg-slate-300 disabled:cursor-not-allowed text-center justify-center flex items-center"
        >
          {isValidating ? "Validating..." : "Validate"}
        </button>
      </div>

      {errorMessage && (
        <p className="text-xs text-rose-500 mt-1.5 font-medium">
          {errorMessage}
        </p>
      )}

      {preview && !errorMessage && (
        <div className="mt-2.5 flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50/80">
          <img
            src={preview.thumbnail}
            alt="Video thumbnail"
            className="w-16 h-10 sm:w-20 sm:h-12 object-cover rounded-md border border-slate-200 bg-slate-200 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
              Verified YouTube Link
            </span>
            <p className="text-xs font-medium text-slate-700 truncate mt-0.5">
              {preview.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Modal Component ────────────────────────────────────────────────────
export interface AddPartsModalProps {
  isOpen?: boolean;
  mode?: "add" | "edit";
  title?: string;
  initial?: JourneyPart | null;
  onClose: () => void;
  onSave: (form: PartFormData, preview: VideoPreview | null) => void;
}

export function AddPartsModal({
  isOpen = true,
  mode,
  title,
  initial,
  onClose,
  onSave,
}: AddPartsModalProps) {
  const isEditMode = mode === "edit" || Boolean(initial);
  const modalTitle = title ?? (isEditMode ? "Edit Part" : "Add New Part");
  const submitLabel = isEditMode ? "Save Part" : "Add Part";

  const [form, setForm] = useState<PartFormData>(() =>
    initial
      ? {
          title: initial.title,
          type: initial.type,
          status: initial.status,
          videoUrl: initial.videoUrl ?? "",
          textContent: initial.textContent ?? "",
        }
      : EMPTY_PART_FORM,
  );

  const [preview, setPreview] = useState<VideoPreview | null>(() =>
    initial?.videoTitle
      ? {
          title: initial.videoTitle,
          thumbnail: initial.videoThumbnail ?? "",
        }
      : null,
  );

  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setForm(
      initial
        ? {
            title: initial.title,
            type: initial.type,
            status: initial.status,
            videoUrl: initial.videoUrl ?? "",
            textContent: initial.textContent ?? "",
          }
        : EMPTY_PART_FORM,
    );
    setPreview(
      initial?.videoTitle
        ? {
            title: initial.videoTitle,
            thumbnail: initial.videoThumbnail ?? "",
          }
        : null,
    );
  }

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const canSave = Boolean(form.title.trim().length > 0);

  const handleSave = () => {
    if (!canSave) return;
    onSave(form, preview);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg mx-3 sm:mx-auto rounded-2xl shadow-2xl border border-slate-200 flex flex-col relative z-10 max-h-[85vh] overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-2xl shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">{modalTitle}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure media, scripture content, and publishing status.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 bg-white overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Part Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Part Title <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g. Part 1 — The Foundations of Faith"
              className="w-full h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition"
            />
          </div>

          {/* Content Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Content Type <span className="text-red-500 ml-0.5">*</span>
            </label>
            <SwitchTab
              activeTab={form.type}
              onChange={(type) => setForm((prev) => ({ ...prev, type }))}
            />
          </div>

          {/* Conditional Video Link */}
          {(form.type === "video" || form.type === "both") && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Video Link
              </label>
              <VideoLinkValidate
                videoUrl={form.videoUrl}
                onChangeVideoUrl={(url) => {
                  setForm((prev) => ({ ...prev, videoUrl: url }));
                  setPreview(null);
                }}
                preview={preview}
                onPreviewChange={setPreview}
              />
            </div>
          )}

          {/* Conditional Written Passage */}
          {(form.type === "text" || form.type === "both") && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Written Passage / Reading Material
                </label>
                <span className="text-xs text-slate-400 font-medium">
                  {form.textContent.length} chars
                </span>
              </div>
              <textarea
                rows={4}
                value={form.textContent}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, textContent: e.target.value }))
                }
                placeholder="Read Matthew 6:5-15. Reflect on what Jesus teaches regarding prayer..."
                className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 resize-none transition"
              />
            </div>
          )}

          {/* Part Status */}
          <div className="pb-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Part Status
            </label>
            <StatusDropdown
              value={form.status}
              onChange={(status) => setForm((prev) => ({ ...prev, status }))}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:px-6 sm:py-4 border-t border-slate-100 bg-white flex items-center justify-end gap-2.5 sm:gap-3 rounded-b-2xl shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-initial text-center justify-center text-slate-600 hover:text-slate-900 text-sm font-medium px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer select-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={
              !canSave
                ? "flex-1 sm:flex-initial text-center justify-center bg-slate-300 text-white text-sm font-medium px-5 py-2.5 rounded-xl cursor-not-allowed select-none"
                : "flex-1 sm:flex-initial text-center justify-center bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer select-none"
            }
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddPartsModal;
