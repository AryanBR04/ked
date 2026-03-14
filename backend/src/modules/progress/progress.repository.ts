import { execute, query } from "../../config/db";
import type { VideoProgressRecord } from "../../types/domain";

interface LastWatchedRow {
  video_id: number;
  last_position_seconds: number;
}

export async function getVideoProgressRecord(
  userId: number,
  videoId: number
): Promise<VideoProgressRecord | null> {
  const rows = await query<VideoProgressRecord[]>(
    `
      SELECT id, user_id, video_id, last_position_seconds, is_completed, completed_at, created_at, updated_at
      FROM video_progress
      WHERE user_id = ?
        AND video_id = ?
      LIMIT 1
    `,
    [userId, videoId]
  );

  return rows[0] ?? null;
}

export async function getCompletedVideoIdsForSubject(userId: number, subjectId: number): Promise<number[]> {
  const rows = await query<Array<{ video_id: number }>>(
    `
      SELECT vp.video_id
      FROM video_progress vp
      INNER JOIN videos vid ON vid.id = vp.video_id
      INNER JOIN sections sec ON sec.id = vid.section_id
      WHERE vp.user_id = ?
        AND sec.subject_id = ?
        AND vp.is_completed = 1
    `,
    [userId, subjectId]
  );

  return rows.map((row) => row.video_id);
}

export async function getLastWatchedForSubject(
  userId: number,
  subjectId: number
): Promise<LastWatchedRow | null> {
  const rows = await query<LastWatchedRow[]>(
    `
      SELECT vp.video_id, vp.last_position_seconds
      FROM video_progress vp
      INNER JOIN videos vid ON vid.id = vp.video_id
      INNER JOIN sections sec ON sec.id = vid.section_id
      WHERE vp.user_id = ?
        AND sec.subject_id = ?
      ORDER BY vp.updated_at DESC
      LIMIT 1
    `,
    [userId, subjectId]
  );

  return rows[0] ?? null;
}

export async function upsertVideoProgress(input: {
  userId: number;
  videoId: number;
  lastPositionSeconds: number;
  isCompleted: boolean;
}) {
  await execute(
    `
      INSERT INTO video_progress (
        user_id,
        video_id,
        last_position_seconds,
        is_completed,
        completed_at
      )
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        last_position_seconds = VALUES(last_position_seconds),
        is_completed = GREATEST(is_completed, VALUES(is_completed)),
        completed_at = CASE
          WHEN GREATEST(is_completed, VALUES(is_completed)) = 1
            THEN COALESCE(completed_at, VALUES(completed_at))
          ELSE NULL
        END,
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      input.userId,
      input.videoId,
      input.lastPositionSeconds,
      input.isCompleted ? 1 : 0,
      input.isCompleted ? new Date() : null
    ]
  );
}

