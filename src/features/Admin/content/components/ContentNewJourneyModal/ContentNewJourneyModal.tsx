import { X } from "lucide-react";
import type { Journey } from "../../models/types/adminContent.types";
import { AddPartsModal } from "../ContentAddPartsModal/AddPartsModal";
import { ContentNewJourneyModalMetadata } from "./ContentNewJourneyModalMetadata";
import { ContentNewJourneyModalSeriesParts } from "./ContentNewJourneyModalSeriesParts";
import { useJourneyModalViewModel } from "../../viewmodels/useJourneyModalViewModel";

export interface ContentNewJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (journey: Journey, isNew: boolean) => void;
  showToast?: (msg: string, type?: "success" | "error") => void;
  initialJourney?: Journey | null;
}

export function ContentNewJourneyModal(props: ContentNewJourneyModalProps) {
  const { isOpen, onClose } = props;
  const vm = useJourneyModalViewModel(props);

  if (!isOpen) return null;

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
            <h2 id="modal-title" className="text-lg font-bold text-slate-900">
              {vm.isEditing ? "Edit Journey" : "Create New Journey"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in details, select categories, and manage curriculum series parts.
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
            title={vm.title}
            onTitleChange={vm.setTitle}
            contentType={vm.contentType}
            onContentTypeChange={vm.setContentType}
            selectedCategories={vm.selectedCategories}
            onToggleCategory={vm.handleToggleCategory}
            summary={vm.summary}
            onSummaryChange={vm.setSummary}
            description={vm.description}
            onDescriptionChange={vm.setDescription}
            thumbnailFile={vm.thumbnailFile}
            thumbnailPreview={vm.thumbnailPreview}
            onThumbnailChange={vm.handleThumbnailChange}
            disabled={vm.isSaving}
          />

          {/* Section 2: Series Parts */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <ContentNewJourneyModalSeriesParts
              parts={vm.parts}
              isLoading={vm.isLoadingParts}
              onAddPart={vm.handleAddPart}
              onEditPart={vm.handleEditPart}
              onDeletePart={vm.handleDeletePart}
              disabled={vm.isSaving || vm.isLoadingParts}
            />
          </div>
        </div>

        {/* 3. Footer Section */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={vm.isSaving}
            className="text-slate-600 hover:text-slate-900 text-sm font-medium px-4 py-2 cursor-pointer transition select-none disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => void vm.handleSave("draft")}
            disabled={vm.isSaving || !vm.isTitleValid}
            className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition select-none shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => void vm.handleSave("published")}
            disabled={!vm.canPublish || vm.isSaving}
            className={
              !vm.canPublish
                ? "opacity-50 cursor-not-allowed bg-slate-400 text-white px-5 py-2 rounded-xl text-sm font-medium select-none"
                : "bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-sm font-medium transition cursor-pointer select-none"
            }
          >
            Publish Series
          </button>
        </div>
      </div>

      {/* Nested Part Modal for Adding/Editing a Part */}
      {vm.partModal && (
        <AddPartsModal
          mode={vm.partModal.mode}
          title={vm.partModal.mode === "add" ? "Add New Part" : "Edit Part"}
          initial={vm.partModal.mode === "edit" ? vm.partModal.part : undefined}
          onClose={vm.handleClosePartModal}
          onSave={vm.handleSavePart}
        />
      )}
    </div>
  );
}

export default ContentNewJourneyModal;
