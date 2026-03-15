import { AppError } from "./errors";

export const YOUTUBE_SORT_FIELDS = ["date", "views", "likes", "subscribers"] as const;

export type YoutubeSortField = typeof YOUTUBE_SORT_FIELDS[number];

const ORDER_BY_BY_SORT_FIELD: Record<YoutubeSortField, string> = {
  date: "published_date DESC",
  views: "views DESC",
  likes: "likes DESC",
  subscribers: "channel_subscribers DESC"
};

export function parseYoutubeSortFields(input: string | string[] | undefined): YoutubeSortField[] {
  const raw = Array.isArray(input) ? input.join(",") : input ?? "";

  if (!raw.trim()) {
    return [];
  }

  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const unique: YoutubeSortField[] = [];

  for (const part of parts) {
    if (!(YOUTUBE_SORT_FIELDS as readonly string[]).includes(part)) {
      throw new AppError(400, "INVALID_SORT_BY", `Unsupported sortBy value: ${part}.`);
    }

    const typedPart = part as YoutubeSortField;

    if (!unique.includes(typedPart)) {
      unique.push(typedPart);
    }
  }

  return unique;
}

export function buildYoutubeCourseOrderBy(sortFields: YoutubeSortField[]) {
  const sortClauses = sortFields.map((field) => ORDER_BY_BY_SORT_FIELD[field]);

  return Array.from(new Set([...sortClauses, "ranking_score DESC", "published_date DESC"])).join(", ");
}
