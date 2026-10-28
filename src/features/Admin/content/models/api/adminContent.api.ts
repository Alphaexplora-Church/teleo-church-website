// ─── Admin Content — Journeys/Series: Pure HTTP Client & Service ─────────────
import { axiosClient } from "../../../../../shared/models/api/axiosClient.api";
import type {
  Journey,
  JourneyCategoryOption,
  JourneyContentType,
  JourneyFormData,
  JourneyPart,
  JourneyQuery,
  JourneyStatus,
  PartStatus,
} from "../types/adminContent.types";
import { mediaTypeFor, validateVideoLink } from "./youtube.api";

// ─── DTO Contracts & Mappers ─────────────────────────────────────────────────
interface ApiJourneyRow {
  journeyId: string;
  title: string;
  description: string | null;
  summary: string | null;
  contentType: string | null;
  status: JourneyStatus;
  thumbnailUrl: string | null;
  categories: string[];
  totalPublishedParts: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiPartRow {
  partId: string;
  partOrder: number;
  title: string;
  mediaUrl: string | null;
  mediaType: string | null;
  readingText: string | null;
  status: PartStatus;
}

const CONTENT_TYPE_FROM_API: Record<string, JourneyContentType> = {
  sunday_service: "sermon-series",
  bible_study: "bible-study",
  devotional: "devotional",
  general: "discipleship-course",
};

const CONTENT_TYPE_TO_API: Record<JourneyContentType, string> = {
  "sermon-series": "sunday_service",
  "bible-study": "bible_study",
  devotional: "devotional",
  "discipleship-course": "general",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isPersisted = (partId: string): boolean => UUID_RE.test(partId);

const toJourney = (row: ApiJourneyRow): Journey => ({
  id: row.journeyId,
  title: row.title,
  description: row.description ?? "",
  contentType: CONTENT_TYPE_FROM_API[row.contentType ?? ""] ?? "sermon-series",
  categories: row.categories ?? [],
  thumbnailUrl: row.thumbnailUrl ?? null,
  summary: row.summary ?? undefined,
  parts: [],
  status: row.status,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const toPart = (row: ApiPartRow): JourneyPart => {
  const hasVideo = Boolean(row.mediaUrl);
  const hasText = Boolean(row.readingText);

  return {
    id: row.partId,
    order: row.partOrder,
    title: row.title,
    type: hasVideo && hasText ? "both" : hasVideo ? "video" : "text",
    status: row.status,
    videoUrl: row.mediaUrl ?? undefined,
    textContent: row.readingText ?? undefined,
  };
};

const withVideoPreviews = async (
  parts: JourneyPart[],
): Promise<JourneyPart[]> =>
  Promise.all(
    parts.map(async (part) => {
      if (!part.videoUrl) return part;
      try {
        const preview = await validateVideoLink(part.videoUrl);
        if (!preview) return part;
        return {
          ...part,
          videoTitle: preview.title,
          videoThumbnail: preview.thumbnail,
        };
      } catch {
        return part;
      }
    }),
  );

const toJourneyPayload = (
  form: JourneyFormData,
  categoryIds: string[],
  file?: File | null,
): { data: object | FormData; headers?: Record<string, string> } => {
  const title = form.title.trim();
  const description = form.description.trim();
  const summary = form.summary.trim();
  const contentType = CONTENT_TYPE_TO_API[form.contentType];
  const safeCategoryIds = Array.isArray(categoryIds) ? categoryIds : [];

  if (!file) {
    return {
      headers: { "Content-Type": "application/json" },
      data: {
        title,
        description,
        summary: summary || null,
        content_type: contentType,
        category_ids: safeCategoryIds,
      },
    };
  }

  const data = new FormData();
  data.append("title", title);
  data.append("description", description);
  data.append("summary", summary);
  data.append("content_type", contentType);
  data.append("category_ids", safeCategoryIds.join(","));
  data.append("image", file);

  return { headers: undefined, data };
};

// ─── Journey HTTP Endpoints ──────────────────────────────────────────────────
let categoryCatalog: JourneyCategoryOption[] | null = null;

export async function fetchJourneys(
  query: JourneyQuery = {},
): Promise<Journey[]> {
  const params: Record<string, string> = { limit: "50" };
  if (query.search) params.search = query.search;
  if (query.status) params.status = query.status;
  if (query.contentType)
    params.content_type = CONTENT_TYPE_TO_API[query.contentType];
  if (query.category) params.category = query.category;

  const response = await axiosClient.get<{ journeys: ApiJourneyRow[] }>(
    "/api/journeys/discover",
    { params },
  );
  return (response.data.journeys ?? []).map(toJourney);
}

export async function fetchJourneyDetail(journeyId: string): Promise<Journey> {
  const response = await axiosClient.get<{
    journey: ApiJourneyRow;
    parts: ApiPartRow[];
  }>(`/api/journeys/${journeyId}`);

  const parts = (response.data.parts ?? [])
    .map(toPart)
    .sort((a, b) => a.order - b.order);

  let partsWithPreviews = parts;
  try {
    partsWithPreviews = await withVideoPreviews(parts);
  } catch (err) {
    console.warn("Failed to load video previews for journey parts:", err);
  }

  return {
    ...toJourney(response.data.journey),
    parts: partsWithPreviews,
  };
}

export async function createJourneyRecord(
  payload: FormData | object,
  headers?: Record<string, string>,
): Promise<{ journeyId: string }> {
  const response = await axiosClient.post<{ journeyId: string }>(
    "/api/journeys",
    payload,
    { headers },
  );
  return response.data;
}

export async function updateJourneyRecord(
  id: string,
  payload: FormData | object,
  headers?: Record<string, string>,
): Promise<void> {
  await axiosClient.patch(`/api/journeys/${id}`, payload, { headers });
}

export async function publishJourney(id: string): Promise<void> {
  await axiosClient.patch(`/api/journeys/${id}/publish`);
}

export async function archiveJourney(id: string): Promise<void> {
  await axiosClient.patch(`/api/journeys/${id}/archive`);
}

export async function fetchCategoryCatalog(): Promise<JourneyCategoryOption[]> {
  if (categoryCatalog) return categoryCatalog;
  const response = await axiosClient.get<{
    categories?: JourneyCategoryOption[];
  }>("/api/journeys/categories");

  categoryCatalog = [...(response.data.categories ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  return categoryCatalog;
}

export async function toCategoryIds(names: string[]): Promise<string[]> {
  if (!Array.isArray(names)) return [];
  const catalog = await fetchCategoryCatalog();
  const idByName = new Map(
    catalog.map((option) => [option.name.toLowerCase(), option.categoryId]),
  );

  return names.map((name) => {
    const id = idByName.get(name.toLowerCase());
    if (!id) throw new Error(`“${name}” is not a category in the catalog.`);
    return id;
  });
}

// ─── Parts HTTP Endpoints ────────────────────────────────────────────────────
export async function createPart(
  journeyId: string,
  title: string,
): Promise<{ partId: string }> {
  const response = await axiosClient.post<{ partId: string }>(
    `/api/journeys/${journeyId}/parts`,
    { title },
  );
  return response.data;
}

export async function updatePart(
  journeyId: string,
  partId: string,
  payload: unknown,
): Promise<void> {
  await axiosClient.put(`/api/journeys/${journeyId}/parts/${partId}`, payload);
}

export async function setPartStatus(
  journeyId: string,
  partId: string,
  status: PartStatus,
): Promise<void> {
  if (status === "archived") {
    await axiosClient.patch(
      `/api/journeys/${journeyId}/parts/${partId}/archive`,
    );
  } else {
    await axiosClient.patch(
      `/api/journeys/${journeyId}/parts/${partId}/publish`,
      { status },
    );
  }
}

export async function reorderParts(
  journeyId: string,
  orderedPartIds: string[],
): Promise<void> {
  await axiosClient.patch(`/api/journeys/${journeyId}/parts/reorder`, {
    orderedPartIds,
  });
}

// ─── Orchestrated Part Synchronization ───────────────────────────────────────
export async function syncJourneyParts(
  journeyId: string,
  parts: JourneyPart[],
  originalParts: JourneyPart[] = [],
): Promise<string[]> {
  const originalById = new Map(originalParts.map((part) => [part.id, part]));
  const resolvedIds: string[] = [];

  for (const part of parts) {
    const before = originalById.get(part.id);

    const contentPayload = {
      title: part.title,
      media_url: part.videoUrl?.trim() || null,
      media_type: mediaTypeFor(part.videoUrl),
      reading_text: part.textContent?.trim() || null,
    };

    if (!before || !isPersisted(part.id)) {
      const { partId } = await createPart(journeyId, part.title);
      resolvedIds.push(partId);

      if (part.videoUrl || part.textContent) {
        await updatePart(journeyId, partId, contentPayload);
      }

      if (part.status !== "draft") {
        await setPartStatus(journeyId, partId, part.status);
      }
      continue;
    }

    resolvedIds.push(part.id);

    const isModified =
      before.title !== part.title ||
      (before.videoUrl ?? "") !== (part.videoUrl ?? "") ||
      (before.textContent ?? "") !== (part.textContent ?? "");

    if (isModified) {
      await updatePart(journeyId, part.id, contentPayload);
    }

    if (before.status !== part.status) {
      await setPartStatus(journeyId, part.id, part.status);
    }
  }

  return resolvedIds;
}

// ─── High-Level Journey Lifecycle Operations ─────────────────────────────────
export async function createJourney(
  form: JourneyFormData,
  parts: JourneyPart[] = [],
  nextStatus?: JourneyStatus,
  thumbnailFile?: File | null,
): Promise<Journey> {
  const categoryIds = await toCategoryIds(form.categories);
  const { headers, data } = toJourneyPayload(form, categoryIds, thumbnailFile);

  const { journeyId } = await createJourneyRecord(data, headers);
  const orderedIds = await syncJourneyParts(journeyId, parts, []);

  if (orderedIds.length > 1) {
    await reorderParts(journeyId, orderedIds);
  }

  if (nextStatus === "published") {
    await publishJourney(journeyId);
  }

  return fetchJourneyDetail(journeyId);
}

export async function saveJourney(
  id: string,
  form: JourneyFormData,
  parts: JourneyPart[],
  nextStatus?: JourneyStatus,
  originalParts: JourneyPart[] = [],
  thumbnailFile?: File | null,
): Promise<Journey> {
  const categoryIds = await toCategoryIds(form.categories);
  const { headers, data } = toJourneyPayload(form, categoryIds, thumbnailFile);

  await updateJourneyRecord(id, data, headers);
  const orderedIds = await syncJourneyParts(id, parts, originalParts);

  const serverOrder = originalParts.map((part) => part.id).join(",");
  if (
    orderedIds.join(",") !== serverOrder &&
    orderedIds.length >= originalParts.length
  ) {
    await reorderParts(id, orderedIds);
  }

  if (nextStatus === "published") {
    await publishJourney(id);
  } else if (nextStatus === "archived") {
    await archiveJourney(id);
  }

  return fetchJourneyDetail(id);
}

export async function setStatus(
  id: string,
  status: JourneyStatus,
): Promise<Journey> {
  if (status === "draft") {
    throw new Error(
      "A journey cannot be moved back to draft. Archive it instead.",
    );
  }
  if (status === "archived") {
    await archiveJourney(id);
  } else {
    await publishJourney(id);
  }
  return fetchJourneyDetail(id);
}
