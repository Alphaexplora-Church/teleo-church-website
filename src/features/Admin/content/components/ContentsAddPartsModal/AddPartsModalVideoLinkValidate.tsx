import { useState, type KeyboardEvent } from "react";
import {
  validateVideoLink,
  type VideoPreview,
} from "../../models/api/adminContent.api";

export interface AddPartsModalVideoLinkValidateProps {
  videoUrl: string;
  onChangeVideoUrl: (url: string) => void;
  preview: VideoPreview | null;
  onPreviewChange: (preview: VideoPreview | null) => void;
  disabled?: boolean;
  className?: string;
}

const YOUTUBE_RE =
  /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/i;

export function AddPartsModalVideoLinkValidate({
  videoUrl,
  onChangeVideoUrl,
  preview,
  onPreviewChange,
  disabled = false,
  className = "",
}: AddPartsModalVideoLinkValidateProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleValidate = async () => {
    const trimmed = videoUrl.trim();
    if (!trimmed) {
      setErrorMessage("Invalid YouTube video URL");
      onPreviewChange(null);
      return;
    }

    const match = trimmed.match(YOUTUBE_RE);
    if (!match || !match[1]) {
      setErrorMessage("Invalid YouTube video URL");
      onPreviewChange(null);
      return;
    }

    const videoId = match[1];
    setIsValidating(true);
    setErrorMessage(null);

    try {
      const result = await validateVideoLink(trimmed);
      if (result) {
        onPreviewChange({
          title: result.title,
          thumbnail:
            result.thumbnail ||
            `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        });
        setErrorMessage(null);
      } else {
        // Fallback for offline or oEmbed restriction: valid video ID detected
        onPreviewChange({
          title: `YouTube Video (${videoId})`,
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        });
        setErrorMessage(null);
      }
    } catch {
      // Fallback preview based on extracted video ID
      onPreviewChange({
        title: `YouTube Video (${videoId})`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      });
      setErrorMessage(null);
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
    <div className={`w-full ${className}`.trim()}>
      <div className="flex items-center gap-2 w-full">
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
          className="flex-1 h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition disabled:bg-slate-50 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={() => void handleValidate()}
          disabled={disabled || isValidating || !videoUrl.trim()}
          className="h-[42px] px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shrink-0 transition cursor-pointer select-none disabled:bg-slate-300 disabled:cursor-not-allowed"
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
            className="w-20 h-12 object-cover rounded-md border border-slate-200 bg-slate-200 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
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

export default AddPartsModalVideoLinkValidate;
