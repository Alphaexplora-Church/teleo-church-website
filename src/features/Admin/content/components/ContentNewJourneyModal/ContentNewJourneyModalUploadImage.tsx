import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Image as ImageIcon } from "lucide-react";

export interface ContentNewJourneyModalUploadImageProps {
  previewUrl?: string | null;
  file?: File | null;
  onFileSelect?: (file: File | null) => void;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
}

export function ContentNewJourneyModalUploadImage({
  previewUrl,
  file,
  onFileSelect,
  disabled = false,
  className = "",
}: ContentNewJourneyModalUploadImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const activePreview = previewUrl || localPreview;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    if (selected) {
      const url = URL.createObjectURL(selected);
      setLocalPreview(url);
      onFileSelect?.(selected);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(droppedFile);
      setLocalPreview(url);
      onFileSelect?.(droppedFile);
    }
  };

  const handleTriggerBrowse = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`p-4 rounded-xl border border-dashed transition-all flex items-center justify-between gap-4 ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-slate-200 bg-slate-50/50"
      } ${className}`.trim()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      {/* Left side: Preview thumbnail box or image placeholder icon */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden">
          {activePreview ? (
            <img
              src={activePreview}
              alt="Thumbnail preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-5 h-5 text-slate-400 stroke-[1.5]" />
          )}
        </div>

        {/* Center text */}
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-800 truncate">
            {file ? file.name : "Drag & drop thumbnail or browse files"}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            PNG, JPG, or WEBP up to 5MB · 1200×800px recommended
          </p>
        </div>
      </div>

      {/* Right side: Clean action button */}
      <button
        type="button"
        onClick={handleTriggerBrowse}
        disabled={disabled}
        className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-xs transition shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none"
      >
        Browse Image
      </button>
    </div>
  );
}

export default ContentNewJourneyModalUploadImage;
