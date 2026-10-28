import { useEffect, useState } from "react";
import { CheckCircle2, Lock, X } from "lucide-react";
import { AdminContentService, type VideoPreview } from "../../models/api/adminContent.api";
import type {
  Journey,
  JourneyContentType,
  JourneyFormData,
  JourneyPart,
  JourneyStatus,
  PartFormData,
} from "../../models/types/adminContent.types";
import { PartModal } from "../../views/PartModal";
import { ContentNewJourneyModalMetadata } from "./ContentNewJourneyModalMetadata";
import { ContentNewJourneyModalSeriesParts } from "./ContentNewJourneyModalSeriesParts";

export interface ContentNewJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (journey: Journey, isNew: boolean) => void;
  showToast?: (msg: string, type?: "success" | "error") => void;
  initialJourney?: Journey | null;
}

export function ContentNewJourneyModal({
  isOpen,
  onClose,
  onSaved,
  showToast,
  initialJourney = null,
}: ContentNewJourneyModalProps) {
  const isEditing = Boolean(initialJourney);

  // Form State
  const [title, setTitle] = useState(initialJourney?.title ?? "");
  const [contentType, setContentType] = useState<JourneyContentType>(
    initialJourney?.contentType ?? "sermon-series",
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialJourney?.categories ?? [],
  );
  const [summary, setSummary] = useState(initialJourney?.summary ?? "");
  const [description, setDescription] = useState(
    initialJourney?.description ?? "",
  );
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    initialJourney?.thumbnailUrl ?? null,
  );

  // Parts State
  const [parts, setParts] = useState<JourneyPart[]>(
    initialJourney?.parts ?? [],
  );
  const [partModal, setPartModal] = useState<
    { mode: "add" } | { mode: "edit"; part: JourneyPart } | null
  >(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync initialJourney changes
  useEffect(() => {
    if (initialJourney) {
      setTitle(initialJourney.title);
      setContentType(initialJourney.contentType);
      setSelectedCategories(initialJourney.categories ?? []);
      setSummary(initialJourney.summary ?? "");
      setDescription(initialJourney.description ?? "");
      setThumbnailPreview(initialJourney.thumbnailUrl ?? null);
      setParts(initialJourney.parts ?? []);
    } else {
      setTitle("");
      setContentType("sermon-series");
      setSelectedCategories([]);
      setSummary("");
      setDescription("");
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setParts([]);
    }
  }, [initialJourney, isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !partModal) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, partModal]);

  if (!isOpen) return null;

  // Validation
  const isTitleValid = Boolean(title.trim().length > 0);
  const isContentTypeValid = Boolean(contentType);
  const isCategoriesValid = selectedCategories.length > 0;
  const isPartsValid =
    parts.length > 0 && parts.some((p) => p.status === "published");

  const canPublish =
    isTitleValid && isContentTypeValid && isPartsValid && isCategoriesValid;

  // Category Toggle
  const handleToggleCategory = (category: string) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((c) => c !== category)
        : [...current, category],
    );
  };

  // Part Handlers
  const handleAddPart = () => {
    setPartModal({ mode: "add" });
  };

  const handleEditPart = (part: JourneyPart) => {
    setPartModal({ mode: "edit", part });
  };

  const handleDeletePart = (partId: string) => {
    setParts((prev) => prev.filter((p) => p.id !== partId));
  };

  const handleSavePart = (
    partForm: PartFormData,
    preview: VideoPreview | null,
  ) => {
    if (!partModal) return;

    if (partModal.mode === "add") {
      const newPart: JourneyPart = {
        id: `tmp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        order: parts.length + 1,
        title: partForm.title,
        type: partForm.type,
        status: partForm.status,
        videoUrl: partForm.videoUrl || undefined,
        videoTitle: preview?.title,
        videoThumbnail: preview?.thumbnail,
        textContent: partForm.textContent || undefined,
      };
      setParts((prev) => [...prev, newPart]);
    } else {
      setParts((prev) =>
        prev.map((p) =>
          p.id === partModal.part.id
            ? {
                ...p,
                title: partForm.title,
                type: partForm.type,
                status: partForm.status,
                videoUrl: partForm.videoUrl || undefined,
                videoTitle: preview?.title,
                videoThumbnail: preview?.thumbnail,
                textContent: partForm.textContent || undefined,
              }
            : p,
        ),
      );
    }
    setPartModal(null);
  };

  // Form Save
  const handleSave = async (status: JourneyStatus) => {
    if (!isTitleValid) {
      showToast?.("Journey Title is required.", "error");
      return;
    }

    if (status === "published" && !canPublish) {
      showToast?.(
        "Publish is locked until required fields are filled and at least one Part is set to Published.",
        "error",
      );
      return;
    }

    const formData: JourneyFormData = {
      title: title.trim(),
      description: description.trim(),
      contentType,
      categories: selectedCategories,
      summary: summary.trim(),
    };

    setIsSaving(true);
    try {
      let saved: Journey;
      if (initialJourney) {
        saved = await AdminContentService.saveJourney(
          initialJourney.id,
          formData,
          parts,
          status,
          initialJourney.parts ?? [],
          thumbnailFile,
        );
      } else {
        saved = await AdminContentService.createJourney(
          formData,
          parts,
          status,
          thumbnailFile,
        );
      }

      onSaved?.(saved, !isEditing);
      showToast?.(
        status === "published"
          ? `“${saved.title}” published.`
          : `“${saved.title}” saved as draft.`,
      );
      onClose();
    } catch (err) {
      showToast?.(
        err instanceof Error ? err.message : "Failed to save journey.",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
    >
      {/* Modal Shell */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden relative">
        {/* 1. Header Section */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2
              id="modal-title"
              className="text-lg font-bold text-slate-900"
            >
              {isEditing ? "Edit Journey" : "Create New Journey"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in details, select categories, and manage curriculum series
              parts.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* 2. Scrollable Body */}
        <div className="px-6 py-5 space-y-6 overflow-y-auto flex-1 bg-white [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Section 1: Metadata Form */}
          <ContentNewJourneyModalMetadata
            title={title}
            onTitleChange={setTitle}
            contentType={contentType}
            onContentTypeChange={setContentType}
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
            summary={summary}
            onSummaryChange={setSummary}
            description={description}
            onDescriptionChange={setDescription}
            thumbnailFile={thumbnailFile}
            thumbnailPreview={thumbnailPreview}
            onThumbnailChange={(file) => {
              setThumbnailFile(file);
              if (file) {
                setThumbnailPreview(URL.createObjectURL(file));
              }
            }}
            disabled={isSaving}
          />

          {/* Section 2: Series Parts */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <ContentNewJourneyModalSeriesParts
              parts={parts}
              onAddPart={handleAddPart}
              onEditPart={handleEditPart}
              onDeletePart={handleDeletePart}
              disabled={isSaving}
            />
          </div>
        </div>

        {/* 3. Footer Section */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white shrink-0">
          {/* Left side: Warning or Readiness Banner */}
          <div>
            {!canPublish ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50/80 px-3.5 py-1.5 text-xs font-medium text-amber-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  Publish is locked until required fields are filled and at
                  least one Part is set to Published.
                </span>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-medium text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Ready to publish series</span>
              </div>
            )}
          </div>

          {/* Right side: Action Buttons (Pure text only, strictly NO icons) */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="text-slate-600 hover:text-slate-900 text-sm font-medium px-4 py-2 cursor-pointer transition select-none disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => void handleSave("draft")}
              disabled={isSaving || !title.trim()}
              className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition select-none shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save as Draft
            </button>

            <button
              type="button"
              onClick={() => void handleSave("published")}
              disabled={!canPublish || isSaving}
              className={
                !canPublish
                  ? "opacity-50 cursor-not-allowed bg-slate-400 text-white px-5 py-2 rounded-xl text-sm font-medium select-none"
                  : "bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-sm font-medium transition cursor-pointer select-none"
              }
            >
              Publish Series
            </button>
          </div>
        </div>
      </div>

      {/* Nested Part Modal for Adding/Editing a Part */}
      {partModal && (
        <PartModal
          title={partModal.mode === "add" ? "Add New Part" : "Edit Part"}
          initial={partModal.mode === "edit" ? partModal.part : undefined}
          onClose={() => setPartModal(null)}
          onSave={handleSavePart}
        />
      )}
    </div>
  );
}

export default ContentNewJourneyModal;
