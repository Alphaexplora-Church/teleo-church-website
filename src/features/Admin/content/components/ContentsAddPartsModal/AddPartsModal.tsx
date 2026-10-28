import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type {
  JourneyPart,
  PartFormData,
} from "../../models/types/adminContent.types";
import { EMPTY_PART_FORM } from "../../models/types/adminContent.types";
import type { VideoPreview } from "../../models/api/adminContent.api";
import { AddPartsModalSwitchTab } from "./AddPartsModalSwitchTab";
import { AddPartsModalDropdown } from "./AddPartsModalDropdown";
import { AddPartsModalVideoLinkValidate } from "./AddPartsModalVideoLinkValidate";

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

    const handleKeyDown = (e: KeyboardEvent) => {
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
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 flex flex-col relative z-10 overflow-visible"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-2xl shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{modalTitle}</h2>
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
        <div className="p-6 space-y-5 bg-white overflow-visible">
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
            <AddPartsModalSwitchTab
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
              <AddPartsModalVideoLinkValidate
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Part Status
            </label>
            <AddPartsModalDropdown
              value={form.status}
              onChange={(status) => setForm((prev) => ({ ...prev, status }))}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-end gap-3 rounded-b-2xl shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 text-sm font-medium px-4 py-2 transition cursor-pointer select-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={
              !canSave
                ? "bg-slate-300 text-white text-sm font-medium px-5 py-2 rounded-xl cursor-not-allowed select-none"
                : "bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-5 py-2 rounded-xl shadow-xs transition cursor-pointer select-none"
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
