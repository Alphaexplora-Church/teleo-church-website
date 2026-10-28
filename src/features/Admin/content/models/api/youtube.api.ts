import type { VideoPreview } from "../types/adminContent.types";

export type { VideoPreview };

/** Regex pattern matching YouTube watch, shorts, embed, and youtu.be URLs */
export const YOUTUBE_RE =
  /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/i;

/** Regex pattern matching Vimeo video URLs */
export const VIMEO_RE = /vimeo\.com\/(?:video\/)?(\d+)/i;

/**
 * Checks if a given string is a valid YouTube URL.
 */
export function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  return YOUTUBE_RE.test(url.trim());
}

/**
 * Extracts the 11-character YouTube video ID from a URL.
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const match = url.trim().match(YOUTUBE_RE);
  return match && match[1] ? match[1] : null;
}

/**
 * Generates a direct high-quality YouTube thumbnail image URL from video ID.
 */
export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Determines media type provider from the video URL string.
 */
export function mediaTypeFor(url?: string): "youtube" | "vimeo" | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (YOUTUBE_RE.test(trimmed)) return "youtube";
  if (VIMEO_RE.test(trimmed)) return "vimeo";
  return null;
}

/**
 * Validates a pasted video link and resolves its title + thumbnail via the
 * provider's public oEmbed endpoint (no API key required). Returns `null`
 * when the link is broken, unreachable, or from an unsupported provider.
 */
export async function validateVideoLink(
  url: string,
): Promise<VideoPreview | null> {
  const trimmed = url.trim();
  if (!trimmed) return null;

  let oEmbedUrl: string | null = null;
  if (YOUTUBE_RE.test(trimmed)) {
    oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(trimmed)}&format=json`;
  } else if (VIMEO_RE.test(trimmed)) {
    oEmbedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(trimmed)}`;
  } else {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6000);
    const response = await fetch(oEmbedUrl, { signal: controller.signal });
    window.clearTimeout(timeout);
    if (!response.ok) return null;

    const json = (await response.json()) as {
      title?: string;
      thumbnail_url?: string;
    };
    if (!json.title) return null;
    return { title: json.title, thumbnail: json.thumbnail_url ?? "" };
  } catch {
    return null;
  }
}

/**
 * Validates a YouTube URL with guaranteed fallback: if oEmbed fails or is offline,
 * falls back to extracting the video ID and using standard YouTube thumbnails.
 */
export async function validateYouTubeUrl(
  url: string,
): Promise<VideoPreview | null> {
  const trimmed = url.trim();
  const videoId = extractYouTubeVideoId(trimmed);
  if (!videoId) return null;

  try {
    const oEmbedResult = await validateVideoLink(trimmed);
    if (oEmbedResult) {
      return {
        title: oEmbedResult.title,
        thumbnail: oEmbedResult.thumbnail || getYouTubeThumbnailUrl(videoId),
      };
    }
  } catch {
    // Proceed to fallback
  }

  // Fallback metadata based on valid video ID
  return {
    title: `YouTube Video (${videoId})`,
    thumbnail: getYouTubeThumbnailUrl(videoId),
  };
}
