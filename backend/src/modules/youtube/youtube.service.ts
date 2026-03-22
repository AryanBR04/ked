import { env } from "../../config/env";
import type { YoutubeCourseProgressRecord, YoutubeCourseRecord } from "../../types/domain";
import { AppError } from "../../utils/errors";
import { handleLessonCompletion } from "../learning-stats/learning.service";
import { normalizeTechnologyLabel, TOP_TECHNOLOGIES } from "../../utils/technologyCatalog";
import { generateCourseOverview } from "../../utils/courseOverview";
import { calculateQualityScore, calculateYoutubeRankingScore } from "../../utils/youtubeRanking";
import { parseYoutubeSortFields, type YoutubeSortField } from "../../utils/youtubeSorting";
import {
  getYoutubeCourseByPlaylistId,
  getYoutubeCourseProgress,
  listCachedYoutubeCoursesByTechnology,
  listActiveYoutubeCourseProgressByUser,
  listNewestYoutubeCourses,
  listRankedYoutubeCourses,
  listRecentYoutubeCourses,
  listStaleYoutubeCoursesByTechnology,
  listTrendingYoutubeCourses,
  listYoutubeCoursesByPlaylistIds,
  listYoutubeCourseProgressByPlaylistIds,
  upsertYoutubeCourseProgress,
  upsertYoutubeCourses,
  getUserLearningProfile,
  upsertUserLearningProfile,
  listRankedYoutubeCoursesByTechnologies
} from "./youtube.repository";
import * as savedRepo from "../saved-courses/saved-courses.repository";

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";
const TRENDING_TECHNOLOGIES = [
  "Python",
  "JavaScript",
  "React",
  "Node.js",
  "Machine Learning",
  "Docker",
  "SQL",
  "TypeScript"
];

const TECHNOLOGY_RELATIONSHIPS: Record<string, string[]> = {
  "Python": ["Django", "Machine Learning", "Data Science", "Flask"],
  "JavaScript": ["React", "Node.js", "TypeScript", "Vue.js"],
  "React": ["Next.js", "TypeScript", "JavaScript"],
  "Machine Learning": ["Data Science", "Python", "Deep Learning"],
  "Node.js": ["Express", "JavaScript", "TypeScript", "Node.js"],
  "Java": ["Spring Boot", "Android Development"],
  "SQL": ["Database Design", "PostgreSQL", "NoSQL"]
};

interface YoutubeSearchResponse {
  nextPageToken?: string;
  items?: Array<{
    id?: { playlistId?: string };
  }>;
}

interface YoutubePlaylistsResponse {
  items?: Array<{
    id?: string;
    snippet?: {
      title?: string;
      channelId?: string;
      channelTitle?: string;
      publishedAt?: string;
      thumbnails?: Record<string, { url: string } | undefined>;
    };
    contentDetails?: {
      itemCount?: number;
    };
  }>;
}

interface YoutubeChannelsResponse {
  items?: Array<{
    id?: string;
    statistics?: {
      subscriberCount?: string;
    };
  }>;
}

interface YoutubePlaylistItemsResponse {
  nextPageToken?: string;
  items?: Array<{
    contentDetails?: {
      videoId?: string;
      videoPublishedAt?: string;
    };
    snippet?: {
      title?: string;
      position?: number;
      thumbnails?: Record<string, { url: string } | undefined>;
    };
    status?: {
      privacyStatus?: string;
    };
  }>;
}

type YoutubePlaylistItem = {
  contentDetails?: {
    videoId?: string;
    videoPublishedAt?: string;
  };
  snippet?: {
    title?: string;
    position?: number;
    thumbnails?: Record<string, { url: string } | undefined>;
  };
  status?: {
    privacyStatus?: string;
  };
};

interface YoutubeVideosResponse {
  items?: Array<{
    id?: string;
    status?: {
      embeddable?: boolean;
    };
    statistics?: {
      viewCount?: string;
      likeCount?: string;
    };
  }>;
}

interface PlaylistLesson {
  video_id: string;
  title: string;
  thumbnail: string | null;
  position: number;
  published_at: string | null;
  is_embeddable: boolean | null;
}

interface SearchCourseCandidate {
  playlistId: string;
  title: string;
  channelName: string;
  channelId: string | null;
  thumbnail: string | null;
  technology: string;
  videoCount: number;
  views: number;
  likes: number;
  channelSubscribers: number;
  publishedDate: string | null;
  rankingScore: number;
  qualityScore: number;
  courseSummary: string;
  skillsTags: string;
  durationSeconds: number;
  difficulty: string;
  lessons: PlaylistLesson[];
}

function toPlaylistLesson(item: YoutubePlaylistItem): PlaylistLesson | null {
  const videoId = item.contentDetails?.videoId;
  const title = item.snippet?.title?.trim() || "Untitled lesson";
  const privacyStatus = item.status?.privacyStatus;

  if (!videoId) {
    return null;
  }

  // Filter out deleted, private, or unavailable videos
  const isUnavailable = 
    privacyStatus === "private" ||
    title.toLowerCase().includes("deleted video") ||
    title.toLowerCase().includes("private video") ||
    title.toLowerCase().includes("unavailable video");

  if (isUnavailable) {
    return null;
  }

  return {
    video_id: videoId,
    title,
    thumbnail: pickThumbnail(item.snippet?.thumbnails),
    position: item.snippet?.position ?? 0,
    published_at: item.contentDetails?.videoPublishedAt ?? null,
    is_embeddable: null
  };
}

function isYoutubeConfigured() {
  return Boolean(env.YOUTUBE_API_KEY?.trim());
}

function buildYoutubeApiUrl(path: string, params: Record<string, string | number | undefined>) {
  const url = new URL(`${YOUTUBE_API_BASE_URL}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  url.searchParams.set("key", env.YOUTUBE_API_KEY ?? "");
  return url.toString();
}

async function youtubeRequest<T>(path: string, params: Record<string, string | number | undefined>) {
  if (!isYoutubeConfigured()) {
    throw new AppError(503, "YOUTUBE_API_DISABLED", "Set YOUTUBE_API_KEY to enable YouTube discovery.");
  }

  const response = await fetch(buildYoutubeApiUrl(path, params), {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    throw new AppError(
      response.status,
      "YOUTUBE_API_ERROR",
      payload?.error?.message ?? "Failed to fetch data from the YouTube API."
    );
  }

  return response.json() as Promise<T>;
}

function pickThumbnail(thumbnails?: Record<string, { url: string } | undefined>) {
  return thumbnails?.maxres?.url
    ?? thumbnails?.standard?.url
    ?? thumbnails?.high?.url
    ?? thumbnails?.medium?.url
    ?? thumbnails?.default?.url
    ?? null;
}

function parsePlaylistLessons(value: string | null) {
  if (!value) {
    return [] as PlaylistLesson[];
  }

  try {
    const parsed = JSON.parse(value) as Array<Partial<PlaylistLesson>>;

    return Array.isArray(parsed)
      ? parsed
          .filter((item): item is Partial<PlaylistLesson> & { video_id: string } => typeof item?.video_id === "string")
          .map((item): PlaylistLesson => ({
            video_id: item.video_id,
            title: item.title?.trim() || "Untitled lesson",
            thumbnail: item.thumbnail ?? null,
            position: typeof item.position === "number" ? item.position : 0,
            published_at: item.published_at ?? null,
            is_embeddable: typeof item.is_embeddable === "boolean" ? item.is_embeddable : null
          }))
      : [];
  } catch {
    return [];
  }
}

function parseCompletedIndexes(progress: YoutubeCourseProgressRecord | null) {
  if (!progress?.completed_video_indexes_json) {
    return [] as number[];
  }

  try {
    const parsed = JSON.parse(progress.completed_video_indexes_json) as number[];
    return Array.isArray(parsed) ? parsed.filter((value) => Number.isInteger(value) && value >= 0) : [];
  } catch {
    return [];
  }
}

function toProgressSummary(progress: YoutubeCourseProgressRecord | null, fallbackTotalVideos: number) {
  const completedVideoIndexes = parseCompletedIndexes(progress);
  const totalVideos = progress?.total_videos ?? fallbackTotalVideos;
  const completedVideos = progress?.completed_videos ?? completedVideoIndexes.length;

  return {
    current_video_index: progress?.current_video_index ?? 0,
    completed_videos: completedVideos,
    total_videos: totalVideos,
    completed_video_indexes: completedVideoIndexes,
    percent_complete: totalVideos === 0 ? 0 : Math.round((completedVideos / totalVideos) * 100),
    last_watched_at: progress?.last_watched_at ?? null
  };
}

function toCourseCard(record: YoutubeCourseRecord, progress?: YoutubeCourseProgressRecord | null, isSaved: boolean = false) {
  return {
    playlist_id: record.playlist_id,
    title: record.title,
    channel_name: record.channel_name,
    channel_subscribers: record.channel_subscribers,
    thumbnail: record.thumbnail,
    technology: record.technology,
    video_count: record.video_count,
    views: record.views,
    likes: record.likes,
    published_date: record.published_date,
    ranking_score: record.ranking_score,
    quality_score: record.quality_score,
    course_summary: record.course_summary,
    skills_tags: record.skills_tags ? JSON.parse(record.skills_tags) : null,
    duration_seconds: record.duration_seconds,
    difficulty: record.difficulty,
    progress: progress ? toProgressSummary(progress, record.video_count) : null,
    is_saved: isSaved
  };
}

function dedupeYoutubeCourses(records: YoutubeCourseRecord[]) {
  const deduped = new Map<string, YoutubeCourseRecord>();

  for (const record of records) {
    const existing = deduped.get(record.playlist_id);

    if (
      !existing
      || record.updated_at > existing.updated_at
      || (
        record.updated_at.getTime() === existing.updated_at.getTime()
        && record.ranking_score > existing.ranking_score
      )
    ) {
      deduped.set(record.playlist_id, record);
    }
  }

  return Array.from(deduped.values());
}

async function hydrateCourseCards(records: YoutubeCourseRecord[], userId?: number) {
  const items = dedupeYoutubeCourses(records);

  if (!userId || !items.length) {
    return items.map((item) => toCourseCard(item, null));
  }

  const [progressRows, savedPlaylistIds] = await Promise.all([
    listYoutubeCourseProgressByPlaylistIds(
      userId,
      items.map((item) => item.playlist_id)
    ),
    savedRepo.getSavedPlaylistIds(userId)
  ]);

  const progressByPlaylistId = new Map(progressRows.map((row) => [row.playlist_id, row]));
  const savedSet = new Set(savedPlaylistIds);

  return items.map((item) => toCourseCard(
    item, 
    progressByPlaylistId.get(item.playlist_id) ?? null,
    savedSet.has(item.playlist_id)
  ));
}

async function fetchPlaylistItemSample(playlistId: string, maxResults = 8) {
  const response = await youtubeRequest<YoutubePlaylistItemsResponse>("/playlistItems", {
    part: "snippet,contentDetails,status",
    playlistId,
    maxResults
  });

  const lessons = (response.items ?? [])
    .map((item) => toPlaylistLesson(item))
    .filter((item): item is PlaylistLesson => item !== null)
    .map((lesson, index) => ({ ...lesson, position: index }));

  const embeddableByVideoId = await fetchVideoEmbeddability(lessons.map((lesson) => lesson.video_id));

  return lessons.map((lesson) => ({
    ...lesson,
    is_embeddable: embeddableByVideoId.get(lesson.video_id) ?? true
  }));
}

async function fetchAllPlaylistLessons(playlistId: string) {
  const lessons: PlaylistLesson[] = [];
  let nextPageToken: string | undefined;

  do {
    const response = await youtubeRequest<YoutubePlaylistItemsResponse>("/playlistItems", {
      part: "snippet,contentDetails,status",
      playlistId,
      maxResults: 50,
      pageToken: nextPageToken
    });

    lessons.push(
      ...(response.items ?? [])
        .map((item) => toPlaylistLesson(item))
        .filter((item): item is PlaylistLesson => item !== null)
    );

    nextPageToken = response.nextPageToken;
  } while (nextPageToken);

  const sortedLessons = lessons
    .sort((left, right) => left.position - right.position)
    .map((lesson, index) => ({ ...lesson, position: index }));
  const embeddableByVideoId = await fetchVideoEmbeddability(sortedLessons.map((lesson) => lesson.video_id));

  return sortedLessons.map((lesson) => ({
    ...lesson,
    is_embeddable: embeddableByVideoId.get(lesson.video_id) ?? true
  }));
}

async function fetchVideoStatistics(videoIds: string[]) {
  const stats = new Map<string, { views: number; likes: number }>();

  for (let index = 0; index < videoIds.length; index += 50) {
    const chunk = videoIds.slice(index, index + 50);

    if (!chunk.length) {
      continue;
    }

    const response = await youtubeRequest<YoutubeVideosResponse>("/videos", {
      part: "statistics",
      id: chunk.join(","),
      maxResults: chunk.length
    });

    for (const item of response.items ?? []) {
      if (!item.id) {
        continue;
      }

      stats.set(item.id, {
        views: Number(item.statistics?.viewCount ?? 0),
        likes: Number(item.statistics?.likeCount ?? 0)
      });
    }
  }

  return stats;
}

async function fetchVideoEmbeddability(videoIds: string[]) {
  const statuses = new Map<string, boolean>();

  for (let index = 0; index < videoIds.length; index += 50) {
    const chunk = videoIds.slice(index, index + 50);

    if (!chunk.length) {
      continue;
    }

    const response = await youtubeRequest<YoutubeVideosResponse>("/videos", {
      part: "status",
      id: chunk.join(","),
      maxResults: chunk.length
    });

    for (const item of response.items ?? []) {
      if (!item.id) {
        continue;
      }

      statuses.set(item.id, item.status?.embeddable ?? true);
    }
  }

  return statuses;
}

async function fetchChannelSubscribers(channelIds: string[]) {
  const subscribersByChannelId = new Map<string, number>();

  for (let index = 0; index < channelIds.length; index += 50) {
    const chunk = channelIds.slice(index, index + 50);

    if (!chunk.length) {
      continue;
    }

    const response = await youtubeRequest<YoutubeChannelsResponse>("/channels", {
      part: "statistics",
      id: chunk.join(","),
      maxResults: chunk.length
    });

    for (const item of response.items ?? []) {
      if (!item.id) {
        continue;
      }

      subscribersByChannelId.set(item.id, Number(item.statistics?.subscriberCount ?? 0));
    }
  }

  return subscribersByChannelId;
}

async function buildSearchCandidates(technology: string) {
  const playlistIdsSet = new Set<string>();
  let nextPageToken: string | undefined;
  let pagesFetched = 0;
  const MAX_PAGES = 5;
  const TARGET_CANDIDATES = 50;

  console.log(`[YouTube Search] Starting broad search for: "${technology}"`);

  const searchQueries = [
    `${technology} course`,
    `${technology} tutorial`,
    `${technology} playlist`,
    `${technology} programming`
  ];

  for (const q of searchQueries) {
    if (playlistIdsSet.size >= TARGET_CANDIDATES) break;
    
    console.log(`[YouTube Search] Query: "${q}"`);
    nextPageToken = undefined;
    let queryPages = 0;

    do {
      try {
        const searchResponse: YoutubeSearchResponse = await youtubeRequest<YoutubeSearchResponse>("/search", {
          part: "snippet",
          type: "playlist",
          q: q,
          maxResults: 25,
          pageToken: nextPageToken
        });

        const listItems = (searchResponse.items ?? []);
        const pageIds: string[] = listItems
          .map((item: any) => item.id?.playlistId)
          .filter((id: any): id is string => Boolean(id));
        
        pageIds.forEach((id: string) => playlistIdsSet.add(id));
        nextPageToken = searchResponse.nextPageToken;
        queryPages++;
        pagesFetched++;

        console.log(`[YouTube Search] Page ${pagesFetched}: Found ${pageIds.length} playlists. Total unique: ${playlistIdsSet.size}`);
      } catch (err) {
        console.error(`[YouTube Search] Search failed for query "${q}":`, err);
        break;
      }
    } while (playlistIdsSet.size < TARGET_CANDIDATES && nextPageToken && queryPages < 2);
  }

  const playlistIds = Array.from(playlistIdsSet);

  if (!playlistIds.length) {
    console.log(`[YouTube Search] No playlists found at all for: ${technology}`);
    return [] as SearchCourseCandidate[];
  }

  // Fetch details in chunks of 50 (YouTube limit)
  const playlistMap = new Map<string, any>();
  for (let i = 0; i < playlistIds.length; i += 50) {
    const chunk = playlistIds.slice(i, i + 50);
    const playlistsResponse = await youtubeRequest<YoutubePlaylistsResponse>("/playlists", {
      part: "snippet,contentDetails",
      id: chunk.join(","),
      maxResults: chunk.length
    });
    
    (playlistsResponse.items ?? []).forEach(item => {
      if (item.id) playlistMap.set(item.id, item);
    });
  }

  console.log(`[YouTube Search] Playlists details fetched: ${playlistMap.size} out of ${playlistIds.length}`);

  const channelIds = Array.from(
    new Set(
      Array.from(playlistMap.values())
        .map((item) => item.snippet?.channelId)
        .filter((value): value is string => Boolean(value))
    )
  );
  
  const channelSubscribers = await fetchChannelSubscribers(channelIds);
  const sampleLessonsByPlaylist = new Map<string, PlaylistLesson[]>();

  console.log(`[YouTube Search] Extracting sample lessons for ${playlistMap.size} playlists...`);

  await Promise.all(
    Array.from(playlistMap.keys()).map(async (playlistId) => {
      try {
        sampleLessonsByPlaylist.set(playlistId, await fetchPlaylistItemSample(playlistId));
      } catch (err) {
        sampleLessonsByPlaylist.set(playlistId, []);
      }
    })
  );

  const sampleVideoIds = Array.from(
    new Set(
      Array.from(sampleLessonsByPlaylist.values())
        .flat()
        .map((lesson) => lesson.video_id)
    )
  );
  const videoStats = await fetchVideoStatistics(sampleVideoIds);

  const candidates = Array.from(playlistMap.keys())
    .map((playlistId) => {
      const playlist = playlistMap.get(playlistId);
      const lessons = sampleLessonsByPlaylist.get(playlistId) ?? [];

      if (!playlist?.snippet || lessons.length === 0) {
        console.warn(`[YouTube Search] Skipping ${playlistId}: No snippet found or 0 valid lessons.`);
        return null;
      }
      const sampleTotals = lessons.reduce(
        (totals, lesson) => {
          const stat = videoStats.get(lesson.video_id);
          return {
            views: totals.views + (stat?.views ?? 0),
            likes: totals.likes + (stat?.likes ?? 0)
          };
        },
        { views: 0, likes: 0 }
      );

      const sampleCount = Math.max(lessons.length, 1);
      const videoCount = Math.max(playlist.contentDetails?.itemCount ?? lessons.length, lessons.length);
      const scale = videoCount / sampleCount;
      const estimatedViews = Math.round(sampleTotals.views * scale);
      const estimatedLikes = Math.round(sampleTotals.likes * scale);
      const publishedDate = playlist.snippet.publishedAt ?? null;
      
      const durationSeconds = videoCount * 15 * 60;
      const difficulty = playlist.snippet.title?.toLowerCase().includes("advanced") ? "Advanced" 
                       : playlist.snippet.title?.toLowerCase().includes("intermediate") ? "Intermediate" 
                       : "Beginner";

      const overview = generateCourseOverview(
        playlist.snippet.title ?? "",
        (playlist as any).snippet.description ?? "",
        lessons.map(l => l.title)
      );

      return {
        playlistId,
        title: playlist.snippet.title?.trim() || "Untitled playlist",
        channelName: playlist.snippet.channelTitle?.trim() || "YouTube creator",
        channelId: playlist.snippet.channelId ?? null,
        thumbnail: pickThumbnail(playlist.snippet.thumbnails),
        technology,
        videoCount,
        views: estimatedViews,
        likes: estimatedLikes,
        channelSubscribers: playlist.snippet.channelId ? (channelSubscribers.get(playlist.snippet.channelId) ?? 0) : 0,
        publishedDate,
        durationSeconds,
        difficulty,
        rankingScore: calculateYoutubeRankingScore({
          views: estimatedViews,
          likes: estimatedLikes,
          publishedDate: publishedDate ?? new Date().toISOString(),
          validRatio: lessons.length / Math.max(videoCount, lessons.length)
        }),
        qualityScore: calculateQualityScore({
          views: estimatedViews,
          likes: estimatedLikes,
          channelSubscribers: playlist.snippet.channelId ? (channelSubscribers.get(playlist.snippet.channelId) ?? 0) : 0,
          publishedDate: publishedDate ?? new Date().toISOString(),
          lessonCount: videoCount,
          validRatio: lessons.length / Math.max(videoCount, lessons.length)
        }),
        courseSummary: overview.courseSummary ?? "No summary available",
        skillsTags: JSON.stringify(overview.skillsTags),
        lessons
      } satisfies SearchCourseCandidate;
    })
    .filter((item): item is SearchCourseCandidate => item !== null);

  console.log(`[YouTube Search] Finished processing. Total valid candidates: ${candidates.length}. Returning top 20.`);

  return candidates
    .sort((left, right) => (right?.rankingScore ?? 0) - (left?.rankingScore ?? 0))
    .slice(0, 20);
}

function getCacheExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + env.YOUTUBE_CACHE_HOURS);
  return expiresAt;
}

async function refreshTechnologyCache(technology: string) {
  const candidates = await buildSearchCandidates(technology);
  const cacheExpiresAt = getCacheExpiryDate();

  await upsertYoutubeCourses(
    candidates
      .filter((candidate): candidate is SearchCourseCandidate => candidate !== null)
      .map((candidate) => ({
        playlistId: candidate.playlistId,
        title: candidate.title,
        channelName: candidate.channelName,
        channelId: candidate.channelId,
        thumbnail: candidate.thumbnail,
        technology,
        videoCount: candidate.videoCount,
        views: candidate.views,
        likes: candidate.likes,
        channelSubscribers: candidate.channelSubscribers,
        publishedDate: candidate.publishedDate,
        rankingScore: candidate.rankingScore,
        qualityScore: candidate.qualityScore,
        courseSummary: candidate.courseSummary,
        skillsTags: candidate.skillsTags,
        playlistItemsJson: JSON.stringify(candidate.lessons),
        duration_seconds: candidate.durationSeconds,
        difficulty: candidate.difficulty,
        cacheExpiresAt
      }))
  );

  return candidates;
}

async function ensureTechnologyResults(technology: string, sortFields: YoutubeSortField[]) {
  const cached = await listCachedYoutubeCoursesByTechnology(technology, 20, sortFields);
  const needsSubscriberRefresh = cached.length > 0 && cached.every((item) => item.channel_subscribers === 0);

  if (cached.length >= 12 && !needsSubscriberRefresh) {
    return {
      source: "cache" as const,
      items: cached
    };
  }

  if (!isYoutubeConfigured()) {
    const stale = await listStaleYoutubeCoursesByTechnology(technology, 20, sortFields);

    if (stale.length) {
      return {
        source: "stale-cache" as const,
        items: stale
      };
    }

    throw new AppError(503, "YOUTUBE_API_DISABLED", "Set YOUTUBE_API_KEY to search fresh YouTube playlists.");
  }

  await refreshTechnologyCache(technology);

  return {
    source: "live" as const,
    items: await listCachedYoutubeCoursesByTechnology(technology, 20, sortFields)
  };
}

async function ensureTrendingResults(limit: number) {
  const cached = await listTrendingYoutubeCourses(limit * 4);

  if (cached.length >= limit) {
    return {
      source: "cache" as const,
      items: cached
    };
  }

  if (!isYoutubeConfigured()) {
    return {
      source: "stale-cache" as const,
      items: await listRecentYoutubeCourses(limit * 4)
    };
  }

  for (const technology of TRENDING_TECHNOLOGIES) {
    await ensureTechnologyResults(technology, []);
  }

  return {
    source: "live" as const,
    items: await listTrendingYoutubeCourses(limit * 4)
  };
}

async function fetchPlaylistDetailsById(playlistId: string, technology?: string | null) {
  const response = await youtubeRequest<YoutubePlaylistsResponse>("/playlists", {
    part: "snippet,contentDetails",
    id: playlistId,
    maxResults: 1
  });
  const playlist = response.items?.[0];

  if (!playlist?.id || !playlist.snippet) {
    throw new AppError(404, "YOUTUBE_PLAYLIST_NOT_FOUND", "Playlist not found on YouTube.");
  }

  const lessons = await fetchAllPlaylistLessons(playlist.id);
  
  if (lessons.length === 0) {
    throw new AppError(404, "YOUTUBE_PLAYLIST_EMPTY", "This playlist is unavailable as it contains no playable videos.");
  }
  const sampledLessons = lessons.slice(0, 10);
  const sampleStats = await fetchVideoStatistics(sampledLessons.map((lesson) => lesson.video_id));
  const sampleTotals = sampledLessons.reduce(
    (totals, lesson) => {
      const stat = sampleStats.get(lesson.video_id);
      return {
        views: totals.views + (stat?.views ?? 0),
        likes: totals.likes + (stat?.likes ?? 0)
      };
    },
    { views: 0, likes: 0 }
  );
  const sampleCount = Math.max(sampledLessons.length, 1);
  const videoCount = Math.max(playlist.contentDetails?.itemCount ?? lessons.length, lessons.length);
  const scale = videoCount / sampleCount;
  const views = Math.round(sampleTotals.views * scale);
  const likes = Math.round(sampleTotals.likes * scale);
  const publishedDate = playlist.snippet.publishedAt ?? null;
  const channelSubscribers = playlist.snippet.channelId
    ? (await fetchChannelSubscribers([playlist.snippet.channelId])).get(playlist.snippet.channelId) ?? 0
    : 0;
  const resolvedTechnology = technology
    ?? normalizeTechnologyLabel(
      TOP_TECHNOLOGIES.find((item) => playlist.snippet?.title?.toLowerCase().includes(item.toLowerCase()))
      ?? "General"
    );

    const overview = generateCourseOverview(
      playlist.snippet.title ?? "",
      (playlist as any).snippet.description ?? "",
      lessons.map(l => l.title)
    );

    await upsertYoutubeCourses([
      {
        playlistId: playlist.id,
        title: playlist.snippet.title?.trim() || "Untitled playlist",
        channelName: playlist.snippet.channelTitle?.trim() || "YouTube creator",
        channelId: playlist.snippet.channelId ?? null,
        thumbnail: pickThumbnail(playlist.snippet.thumbnails),
        technology: resolvedTechnology,
        videoCount,
        views,
        likes,
        channelSubscribers,
        publishedDate,
        rankingScore: calculateYoutubeRankingScore({
          views,
          likes,
          publishedDate: publishedDate ?? new Date().toISOString()
        }),
        qualityScore: calculateQualityScore({
          views,
          likes,
          channelSubscribers,
          publishedDate: publishedDate ?? new Date().toISOString(),
          lessonCount: videoCount
        }),
        courseSummary: overview.courseSummary,
        skillsTags: JSON.stringify(overview.skillsTags),
        playlistItemsJson: JSON.stringify(lessons),
        duration_seconds: videoCount * 15 * 60,
        difficulty: playlist.snippet.title?.toLowerCase().includes("advanced") ? "Advanced" 
                  : playlist.snippet.title?.toLowerCase().includes("intermediate") ? "Intermediate" 
                  : "Beginner",
        cacheExpiresAt: getCacheExpiryDate()
      }
    ]);

  return getYoutubeCourseByPlaylistId(playlist.id);
}

function playlistNeedsRefresh(record: YoutubeCourseRecord | null) {
  if (!record) {
    return true;
  }

  const lessons = parsePlaylistLessons(record.playlist_items_json);

  if (lessons.length < Math.max(record.video_count, 1)) {
    return true;
  }

  if (lessons.some((lesson) => lesson.is_embeddable === null)) {
    return true;
  }

  if (!record.course_summary || !record.skills_tags) {
    return true;
  }

  return new Date(record.cache_expires_at).getTime() <= Date.now();
}

export function listYoutubeTechnologies() {
  return {
    items: TOP_TECHNOLOGIES.map((technology) => ({
      label: technology,
      slug: technology.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    }))
  };
}

export async function getContinueLearningYoutubeCourses(userId?: number, limit = 8) {
  if (!userId) {
    return {
      generated_at: new Date().toISOString(),
      items: []
    };
  }

  const progressRows = await listActiveYoutubeCourseProgressByUser(userId, limit);
  const courseRows = await listYoutubeCoursesByPlaylistIds(progressRows.map((row) => row.playlist_id));
  const courseByPlaylistId = new Map(dedupeYoutubeCourses(courseRows).map((row) => [row.playlist_id, row]));

  return {
    generated_at: new Date().toISOString(),
    items: progressRows
      .map((progress) => {
        const course = courseByPlaylistId.get(progress.playlist_id);
        return course ? toCourseCard(course, progress) : null;
      })
      .filter((item): item is ReturnType<typeof toCourseCard> => Boolean(item))
  };
}

export async function searchYoutubeCourses(
  technologyInput: string,
  userId?: number,
  sortInput?: string | string[]
) {
  const technology = normalizeTechnologyLabel(technologyInput);
  const sortBy = parseYoutubeSortFields(sortInput);
  const result = await ensureTechnologyResults(technology, sortBy);

  return {
    technology,
    sort_by: sortBy,
    source: result.source,
    generated_at: new Date().toISOString(),
    items: await hydrateCourseCards(result.items, userId)
  };
}

export async function getTrendingYoutubeCourses(limit: number, userId?: number) {
  const result = await ensureTrendingResults(limit);

  return {
    source: result.source,
    generated_at: new Date().toISOString(),
    items: (await hydrateCourseCards(result.items, userId)).slice(0, limit)
  };
}

export async function getRecommendedYoutubeCourses(limit: number, userId?: number) {
  if (userId) {
    const profile = await getUserLearningProfile(userId);
    if (profile.length > 0) {
      // Collect studied technologies
      const studiedTechs = profile.map(p => p.technology);
      const relatedTechs = new Set<string>();
      studiedTechs.forEach(tech => {
        (TECHNOLOGY_RELATIONSHIPS[tech] || []).forEach(rel => relatedTechs.add(rel));
      });

      const allRelevantTechs = Array.from(new Set([...studiedTechs, ...Array.from(relatedTechs)]));
      const rankedCourses = await listRankedYoutubeCoursesByTechnologies(allRelevantTechs, limit * 2);
      
      const continueLearning = await getContinueLearningYoutubeCourses(userId, limit);
      const excludedPlaylistIds = new Set(continueLearning.items.map((item) => item.playlist_id));
      const filtered = dedupeYoutubeCourses(rankedCourses).filter((item) => !excludedPlaylistIds.has(item.playlist_id));

      if (filtered.length >= limit) {
        return {
          generated_at: new Date().toISOString(),
          items: (await hydrateCourseCards(filtered, userId)).slice(0, limit)
        };
      }
    }
  }

  // Fallback to general ranked courses
  const ranked = await listRankedYoutubeCourses(limit * 4);
  const continueLearning = userId ? await getContinueLearningYoutubeCourses(userId, limit) : { items: [] };
  const excludedPlaylistIds = new Set(continueLearning.items.map((item) => item.playlist_id));
  const filtered = dedupeYoutubeCourses(ranked).filter((item) => !excludedPlaylistIds.has(item.playlist_id));

  return {
    generated_at: new Date().toISOString(),
    items: (await hydrateCourseCards(filtered, userId)).slice(0, limit)
  };
}

export async function getNewestYoutubeCourses(limit: number, userId?: number) {
  const newest = await listNewestYoutubeCourses(limit * 3);
  const continueLearning = userId ? await getContinueLearningYoutubeCourses(userId, limit) : { items: [] };
  const excludedPlaylistIds = new Set(continueLearning.items.map((item) => item.playlist_id));
  const filtered = dedupeYoutubeCourses(newest).filter((item) => !excludedPlaylistIds.has(item.playlist_id));

  return {
    generated_at: new Date().toISOString(),
    items: (await hydrateCourseCards(filtered, userId)).slice(0, limit)
  };
}

export async function getYoutubePlaylistDetail(userId: number, playlistId: string) {
  let cached = await getYoutubeCourseByPlaylistId(playlistId);

  if (playlistNeedsRefresh(cached)) {
    if (!isYoutubeConfigured()) {
      if (!cached) {
        throw new AppError(
          503,
          "YOUTUBE_API_DISABLED",
          "Set YOUTUBE_API_KEY to load this YouTube playlist for the first time."
        );
      }
    } else {
      cached = await fetchPlaylistDetailsById(playlistId, cached?.technology ?? null);
    }
  }

  if (!cached) {
    throw new AppError(404, "YOUTUBE_PLAYLIST_NOT_FOUND", "Playlist is not cached and could not be loaded.");
  }

  const lessons = parsePlaylistLessons(cached.playlist_items_json);
  const progress = await getYoutubeCourseProgress(userId, playlistId);
  const progressSummary = toProgressSummary(progress, Math.max(cached.video_count, lessons.length));

  return {
    playlist_id: cached.playlist_id,
    title: cached.title,
    channel_name: cached.channel_name,
    thumbnail: cached.thumbnail,
    technology: cached.technology,
    video_count: cached.video_count,
    views: cached.views,
    likes: cached.likes,
    published_date: cached.published_date,
    ranking_score: cached.ranking_score,
    duration_seconds: cached.duration_seconds,
    difficulty: cached.difficulty,
    course_summary: cached.course_summary,
    skills_tags: cached.skills_tags ? JSON.parse(cached.skills_tags) : null,
    lessons,
    progress: progressSummary,
    resume_video_index: Math.min(progressSummary.current_video_index, Math.max(lessons.length - 1, 0))
  };
}

export async function getYoutubePlaylistProgress(userId: number, playlistId: string) {
  const cached = await getYoutubeCourseByPlaylistId(playlistId);
  const progress = await getYoutubeCourseProgress(userId, playlistId);

  return toProgressSummary(progress, cached?.video_count ?? 0);
}

export async function saveYoutubePlaylistProgress(
  userId: number,
  playlistId: string,
  input: {
    current_video_index: number;
    total_videos: number;
    completed_video_index?: number;
  }
) {
  const course = await getYoutubeCourseByPlaylistId(playlistId);

  if (!course) {
    throw new AppError(404, "YOUTUBE_PLAYLIST_NOT_FOUND", "Playlist not found.");
  }

  const safeTotalVideos = Math.max(input.total_videos, course.video_count, 0);
  const clampedCurrentVideoIndex = Math.min(
    Math.max(input.current_video_index, 0),
    Math.max(safeTotalVideos - 1, 0)
  );
  const existing = await getYoutubeCourseProgress(userId, playlistId);
  const completedIndexes = new Set(parseCompletedIndexes(existing));

  if (input.completed_video_index !== undefined) {
    const clampedCompletedIndex = Math.min(
      Math.max(input.completed_video_index, 0),
      Math.max(safeTotalVideos - 1, 0)
    );
    completedIndexes.add(clampedCompletedIndex);
  }

  const completedVideoIndexes = Array.from(completedIndexes).sort((left, right) => left - right);

  await upsertYoutubeCourseProgress({
    userId,
    playlistId,
    currentVideoIndex: clampedCurrentVideoIndex,
    completedVideos: completedVideoIndexes.length,
    totalVideos: safeTotalVideos,
    completedVideoIndexesJson: JSON.stringify(completedVideoIndexes),
    lastWatchedAt: new Date()
  });

  if (input.completed_video_index !== undefined) {
    const avgDurationSeconds = course.video_count > 0 ? (course.duration_seconds || 0) / course.video_count : 0;
    const isCompleted = (completedVideoIndexes.length === safeTotalVideos) && (existing ? existing.completed_videos < safeTotalVideos : true);
    
    await handleLessonCompletion(userId, avgDurationSeconds, isCompleted);
    
    if (isCompleted) {
      await upsertUserLearningProfile({
        userId,
        technology: course.technology,
        skillLevel: course.difficulty as any,
        coursesCompletedDelta: 1
      });
    }
  }

  return getYoutubePlaylistProgress(userId, playlistId);
}
