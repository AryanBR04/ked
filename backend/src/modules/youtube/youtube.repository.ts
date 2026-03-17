import { execute, query } from "../../config/db";
import type { UserLearningProfileRecord, YoutubeCourseProgressRecord, YoutubeCourseRecord } from "../../types/domain";
import { buildYoutubeCourseOrderBy, type YoutubeSortField } from "../../utils/youtubeSorting";

function normalizeDateValue(value: Date | string | null) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value : new Date(value);
}

function selectYoutubeCourseColumns() {
  return `
        id,
        playlist_id,
        title,
        channel_name,
        channel_id,
        thumbnail,
        technology,
        video_count,
        views,
        likes,
        channel_subscribers,
        published_date,
        ranking_score,
        quality_score,
        course_summary,
        skills_tags,
        playlist_items_json,
        duration_seconds,
        difficulty,
        cache_expires_at,
        created_at,
        updated_at
  `;
}

export async function listCachedYoutubeCoursesByTechnology(
  technology: string,
  limit: number,
  sortFields: YoutubeSortField[] = []
) {
  return query<YoutubeCourseRecord[]>(
    `
      SELECT
        ${selectYoutubeCourseColumns()}
      FROM youtube_courses
      WHERE technology = ?
        AND cache_expires_at > UTC_TIMESTAMP()
      ORDER BY ${buildYoutubeCourseOrderBy(sortFields)}
      LIMIT ?
    `,
    [technology, limit]
  );
}

export async function listStaleYoutubeCoursesByTechnology(
  technology: string,
  limit: number,
  sortFields: YoutubeSortField[] = []
) {
  return query<YoutubeCourseRecord[]>(
    `
      SELECT
        ${selectYoutubeCourseColumns()}
      FROM youtube_courses
      WHERE technology = ?
      ORDER BY ${buildYoutubeCourseOrderBy(sortFields)}
      LIMIT ?
    `,
    [technology, limit]
  );
}

export async function listTrendingYoutubeCourses(limit: number) {
  return query<YoutubeCourseRecord[]>(
    `
      SELECT
        ${selectYoutubeCourseColumns()}
      FROM youtube_courses
      WHERE cache_expires_at > UTC_TIMESTAMP()
        AND published_date > DATE_SUB(UTC_TIMESTAMP(), INTERVAL 3 YEAR)
      ORDER BY quality_score DESC, ranking_score DESC
      LIMIT ?
    `,
    [limit]
  );
}

export async function listRankedYoutubeCourses(limit: number) {
  return query<YoutubeCourseRecord[]>(
    `
      SELECT
        ${selectYoutubeCourseColumns()}
      FROM youtube_courses
      WHERE cache_expires_at > UTC_TIMESTAMP()
      ORDER BY quality_score DESC, ranking_score DESC
      LIMIT ?
    `,
    [limit]
  );
}

export async function listRecentYoutubeCourses(limit: number) {
  return query<YoutubeCourseRecord[]>(
    `
      SELECT
        ${selectYoutubeCourseColumns()}
      FROM youtube_courses
      ORDER BY updated_at DESC, quality_score DESC
      LIMIT ?
    `,
    [limit]
  );
}

export async function listNewestYoutubeCourses(limit: number) {
  return query<YoutubeCourseRecord[]>(
    `
      SELECT
        ${selectYoutubeCourseColumns()}
      FROM youtube_courses
      WHERE cache_expires_at > UTC_TIMESTAMP()
      ORDER BY published_date DESC, quality_score DESC
      LIMIT ?
    `,
    [limit]
  );
}

export async function getYoutubeCourseByPlaylistId(playlistId: string) {
  const rows = await query<YoutubeCourseRecord[]>(
    `
      SELECT
        ${selectYoutubeCourseColumns()}
      FROM youtube_courses
      WHERE playlist_id = ?
      ORDER BY ranking_score DESC, updated_at DESC
      LIMIT 1
    `,
    [playlistId]
  );

  return rows[0] ?? null;
}

export async function listYoutubeCoursesByPlaylistIds(playlistIds: string[]) {
  if (!playlistIds.length) {
    return [] as YoutubeCourseRecord[];
  }

  const placeholders = playlistIds.map(() => "?").join(", ");

  return query<YoutubeCourseRecord[]>(
    `
      SELECT
        ${selectYoutubeCourseColumns()}
      FROM youtube_courses
      WHERE playlist_id IN (${placeholders})
      ORDER BY updated_at DESC, ranking_score DESC, id DESC
    `,
    playlistIds
  );
}

export async function upsertYoutubeCourses(
  entries: Array<{
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
    publishedDate: Date | string | null;
    rankingScore: number;
    qualityScore: number;
    courseSummary: string | null;
    skillsTags: string | null;
    playlistItemsJson: string | null;
    duration_seconds: number;
    difficulty: string;
    cacheExpiresAt: Date;
  }>
) {
  for (const entry of entries) {
    await execute(
      `
        INSERT INTO youtube_courses (
          playlist_id,
          title,
          channel_name,
          channel_id,
          thumbnail,
          technology,
          video_count,
          views,
          likes,
          channel_subscribers,
          published_date,
          ranking_score,
          quality_score,
          course_summary,
          skills_tags,
          playlist_items_json,
          duration_seconds,
          difficulty,
          cache_expires_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          channel_name = VALUES(channel_name),
          channel_id = VALUES(channel_id),
          thumbnail = VALUES(thumbnail),
          video_count = VALUES(video_count),
          views = VALUES(views),
          likes = VALUES(likes),
          channel_subscribers = VALUES(channel_subscribers),
          published_date = VALUES(published_date),
          ranking_score = VALUES(ranking_score),
          quality_score = VALUES(quality_score),
          course_summary = VALUES(course_summary),
          skills_tags = VALUES(skills_tags),
          playlist_items_json = COALESCE(VALUES(playlist_items_json), playlist_items_json),
          duration_seconds = VALUES(duration_seconds),
          difficulty = VALUES(difficulty),
          cache_expires_at = VALUES(cache_expires_at),
          updated_at = CURRENT_TIMESTAMP
      `,
      [
        entry.playlistId,
        entry.title,
        entry.channelName,
        entry.channelId,
        entry.thumbnail,
        entry.technology,
        entry.videoCount,
        entry.views,
        entry.likes,
        entry.channelSubscribers,
        normalizeDateValue(entry.publishedDate),
        entry.rankingScore,
        entry.qualityScore,
        entry.courseSummary,
        entry.skillsTags,
        entry.playlistItemsJson,
        entry.duration_seconds,
        entry.difficulty,
        normalizeDateValue(entry.cacheExpiresAt)
      ]
    );
  }
}

export async function getYoutubeCourseProgress(userId: number, playlistId: string) {
  const rows = await query<YoutubeCourseProgressRecord[]>(
    `
      SELECT
        id,
        user_id,
        playlist_id,
        current_video_index,
        completed_videos,
        total_videos,
        completed_video_indexes_json,
        last_watched_at,
        created_at,
        updated_at
      FROM course_progress
      WHERE user_id = ?
        AND playlist_id = ?
      LIMIT 1
    `,
    [userId, playlistId]
  );

  return rows[0] ?? null;
}

export async function listYoutubeCourseProgressByPlaylistIds(userId: number, playlistIds: string[]) {
  if (!playlistIds.length) {
    return [] as YoutubeCourseProgressRecord[];
  }

  const placeholders = playlistIds.map(() => "?").join(", ");

  return query<YoutubeCourseProgressRecord[]>(
    `
      SELECT
        id,
        user_id,
        playlist_id,
        current_video_index,
        completed_videos,
        total_videos,
        completed_video_indexes_json,
        last_watched_at,
        created_at,
        updated_at
      FROM course_progress
      WHERE user_id = ?
        AND playlist_id IN (${placeholders})
    `,
    [userId, ...playlistIds]
  );
}

export async function listActiveYoutubeCourseProgressByUser(userId: number, limit: number) {
  return query<YoutubeCourseProgressRecord[]>(
    `
      SELECT
        id,
        user_id,
        playlist_id,
        current_video_index,
        completed_videos,
        total_videos,
        completed_video_indexes_json,
        last_watched_at,
        created_at,
        updated_at
      FROM course_progress
      WHERE user_id = ?
        AND completed_videos > 0
        AND completed_videos < total_videos
      ORDER BY last_watched_at DESC, updated_at DESC
      LIMIT ?
    `,
    [userId, limit]
  );
}

export async function upsertYoutubeCourseProgress(input: {
  userId: number;
  playlistId: string;
  currentVideoIndex: number;
  completedVideos: number;
  totalVideos: number;
  completedVideoIndexesJson: string;
  lastWatchedAt: Date;
}) {
  await execute(
    `
      INSERT INTO course_progress (
        user_id,
        playlist_id,
        current_video_index,
        completed_videos,
        total_videos,
        completed_video_indexes_json,
        last_watched_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        current_video_index = VALUES(current_video_index),
        completed_videos = VALUES(completed_videos),
        total_videos = VALUES(total_videos),
        completed_video_indexes_json = VALUES(completed_video_indexes_json),
        last_watched_at = VALUES(last_watched_at),
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      input.lastWatchedAt
    ]
  );
}

export async function getUserLearningProfile(userId: number) {
  return query<UserLearningProfileRecord[]>(
    `
      SELECT
        id,
        user_id,
        technology,
        skill_level,
        courses_completed,
        last_updated
      FROM user_learning_profile
      WHERE user_id = ?
      ORDER BY last_updated DESC
    `,
    [userId]
  );
}

export async function upsertUserLearningProfile(input: {
  userId: number;
  technology: string;
  skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  coursesCompletedDelta: number;
}) {
  await execute(
    `
      INSERT INTO user_learning_profile (
        user_id,
        technology,
        skill_level,
        courses_completed
      )
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        courses_completed = courses_completed + VALUES(courses_completed),
        skill_level = COALESCE(VALUES(skill_level), skill_level),
        last_updated = CURRENT_TIMESTAMP
    `,
    [
      input.userId,
      input.technology,
      input.skillLevel ?? 'Beginner',
      input.coursesCompletedDelta
    ]
  );
}

export async function listRankedYoutubeCoursesByTechnologies(technologies: string[], limit: number) {
  if (!technologies.length) return [];

  const placeholders = technologies.map(() => "?").join(", ");

  return query<YoutubeCourseRecord[]>(
    `
      SELECT
        ${selectYoutubeCourseColumns()}
      FROM youtube_courses
      WHERE technology IN (${placeholders})
        AND cache_expires_at > UTC_TIMESTAMP()
      ORDER BY quality_score DESC, ranking_score DESC
      LIMIT ?
    `,
    [...technologies, limit]
  );
}
