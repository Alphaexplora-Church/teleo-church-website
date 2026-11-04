import { useEffect, useState } from "react";
import {
  createJourney,
  fetchCategoryCatalog,
  fetchJourneyDetail,
  saveJourney,
} from "../models/api/adminContent.api";
import { uid } from "../models/constants/adminContent.constants";
import type {
  Journey,
  JourneyCategoryOption,
  JourneyContentType,
  JourneyFormData,
  JourneyPart,
  JourneyStatus,
  PartFormData,
  VideoPreview,
} from "../models/types/adminContent.types";

export interface UseJourneyModalViewModelProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (journey: Journey, isNew: boolean) => void;
  showToast?: (msg: string, type?: "success" | "error") => void;
  initialJourney?: Journey | null;
}

export type PartModalMode =
  | { mode: "add" }
  | { mode: "edit"; part: JourneyPart }
  | null;

/**
 * Normalizes an array of category identifiers/names against the loaded category catalog,
 * ensuring case-insensitive matching and canonical title mapping.
 */
export function resolveCategoryNames(
  categories: string[],
  catalog: JourneyCategoryOption[],
): string[] {
  if (!Array.isArray(categories) || categories.length === 0) return [];
  if (!Array.isArray(catalog) || catalog.length === 0) return categories;

  const idMap = new Map<string, string>();
  for (const item of catalog) {
    idMap.set(item.categoryId.toLowerCase(), item.name);
    idMap.set(item.name.toLowerCase(), item.name);
  }

  return categories.map((cat) => {
    const trimmed = cat.trim();
    return idMap.get(trimmed.toLowerCase()) ?? trimmed;
  });
}

export function useJourneyModalViewModel({
  isOpen,
  onClose,
  onSaved,
  showToast,
  initialJourney = null,
}: UseJourneyModalViewModelProps) {
  const isEditing = Boolean(initialJourney);

  // Dynamic Category Catalog
  const [categoryOptions, setCategoryOptions] = useState<
    JourneyCategoryOption[]
  >([]);

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
  const [originalParts, setOriginalParts] = useState<JourneyPart[]>(
    initialJourney?.parts ?? [],
  );
  const [isLoadingParts, setIsLoadingParts] = useState(false);

  const [partModal, setPartModal] = useState<PartModalMode>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch dynamic category catalog on mount
  useEffect(() => {
    let isCancelled = false;
    fetchCategoryCatalog()
      .then((catalog) => {
        if (!isCancelled && Array.isArray(catalog) && catalog.length > 0) {
          setCategoryOptions(catalog);
          setSelectedCategories((current) =>
            resolveCategoryNames(current, catalog),
          );
        }
      })
      .catch((err) => {
        console.error("Failed to fetch category catalog:", err);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Sync initialJourney changes and fetch full details (including parts)
  useEffect(() => {
    if (!isOpen) return;

    if (initialJourney) {
      setTitle(initialJourney.title);
      setContentType(initialJourney.contentType);
      const rawCategories = initialJourney.categories ?? [];
      setSelectedCategories(
        categoryOptions.length > 0
          ? resolveCategoryNames(rawCategories, categoryOptions)
          : rawCategories,
      );
      setSummary(initialJourney.summary ?? "");
      setDescription(initialJourney.description ?? "");
      setThumbnailPreview(initialJourney.thumbnailUrl ?? null);

      const existingParts = initialJourney.parts ?? [];
      setParts(existingParts);
      setOriginalParts(existingParts);

      if (initialJourney.id) {
        let isCancelled = false;
        setIsLoadingParts(true);

        fetchJourneyDetail(initialJourney.id)
          .then((detailed) => {
            if (isCancelled) return;
            const fetchedParts = detailed.parts ?? [];
            setParts(fetchedParts);
            setOriginalParts(fetchedParts);

            if (detailed.summary && !initialJourney.summary) {
              setSummary(detailed.summary);
            }
            if (detailed.description && !initialJourney.description) {
              setDescription(detailed.description);
            }
            if (detailed.thumbnailUrl && !initialJourney.thumbnailUrl) {
              setThumbnailPreview(detailed.thumbnailUrl);
            }
            if (detailed.categories && detailed.categories.length > 0) {
              setSelectedCategories((current) =>
                current.length > 0
                  ? current
                  : resolveCategoryNames(detailed.categories, categoryOptions),
              );
            }
          })
          .catch((err) => {
            if (isCancelled) return;
            console.error("Failed to fetch journey detail parts:", err);
          })
          .finally(() => {
            if (!isCancelled) {
              setIsLoadingParts(false);
            }
          });

        return () => {
          isCancelled = true;
        };
      }
    } else {
      setTitle("");
      setContentType("sermon-series");
      setSelectedCategories([]);
      setSummary("");
      setDescription("");
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setParts([]);
      setOriginalParts([]);
      setIsLoadingParts(false);
    }
  }, [categoryOptions, initialJourney, isOpen]);

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

  // Validation
  const isTitleValid = Boolean(title.trim().length > 0);
  const isContentTypeValid = Boolean(contentType);
  const isCategoriesValid = selectedCategories.length > 0;
  const isPartsValid =
    parts.length > 0 && parts.some((p) => p.status === "published");

  const canPublish =
    isTitleValid &&
    isContentTypeValid &&
    isPartsValid &&
    isCategoriesValid &&
    !isLoadingParts;

  // Category Toggle
  const handleToggleCategory = (category: string) => {
    setSelectedCategories((current) => {
      const exists = current.some(
        (c) => c.toLowerCase() === category.toLowerCase(),
      );
      return exists
        ? current.filter((c) => c.toLowerCase() !== category.toLowerCase())
        : [...current, category];
    });
  };

  const handleThumbnailChange = (file: File | null) => {
    setThumbnailFile(file);
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      setThumbnailPreview(null);
    }
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

  const handleClosePartModal = () => {
    setPartModal(null);
  };

  const handleSavePart = (
    partForm: PartFormData,
    preview: VideoPreview | null,
  ) => {
    if (!partModal) return;

    if (partModal.mode === "add") {
      const newPart: JourneyPart = {
        id: `tmp_${uid()}`,
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

  const handleReorderParts = (newParts: JourneyPart[]) => {
    const reordered = newParts.map((part, index) => ({
      ...part,
      order: index + 1,
    }));
    setParts(reordered);
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
        saved = await saveJourney(
          initialJourney.id,
          formData,
          parts,
          status,
          originalParts,
          thumbnailFile,
        );
      } else {
        saved = await createJourney(
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

  return {
    isEditing,
    isSaving,
    isLoadingParts,
    title,
    setTitle,
    contentType,
    setContentType,
    categoryOptions,
    selectedCategories,
    handleToggleCategory,
    summary,
    setSummary,
    description,
    setDescription,
    thumbnailFile,
    thumbnailPreview,
    handleThumbnailChange,
    parts,
    partModal,
    handleAddPart,
    handleEditPart,
    handleDeletePart,
    handleClosePartModal,
    handleSavePart,
    handleReorderParts,
    handleSave,
    isTitleValid,
    canPublish,
  };
}
