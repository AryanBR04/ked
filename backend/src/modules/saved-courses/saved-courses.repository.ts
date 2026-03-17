import { execute, query } from "../../config/db";
import { YoutubeCourseRecord } from "../../types/domain";

export async function isCourseSaved(userId: number, playlistId: string): Promise<boolean> {
  const rows = await query<any[]>(
    "SELECT id FROM saved_courses WHERE user_id = ? AND playlist_id = ?",
    [userId, playlistId]
  );
  return rows.length > 0;
}

export async function saveCourse(userId: number, playlistId: string): Promise<void> {
  await execute(
    "INSERT IGNORE INTO saved_courses (user_id, playlist_id, created_at) VALUES (?, ?, NOW())",
    [userId, playlistId]
  );
}

export async function unsaveCourse(userId: number, playlistId: string): Promise<void> {
  await execute(
    "DELETE FROM saved_courses WHERE user_id = ? AND playlist_id = ?",
    [userId, playlistId]
  );
}

export async function listSavedCourses(userId: number): Promise<YoutubeCourseRecord[]> {
  return query<YoutubeCourseRecord[]>(
    `
    SELECT yc.* 
    FROM saved_courses sc
    JOIN youtube_courses yc ON sc.playlist_id = yc.playlist_id
    WHERE sc.user_id = ?
    ORDER BY sc.created_at DESC
    `,
    [userId]
  );
}

export async function getSavedPlaylistIds(userId: number): Promise<string[]> {
  const rows = await query<{ playlist_id: string }[]>(
    "SELECT playlist_id FROM saved_courses WHERE user_id = ?",
    [userId]
  );
  return rows.map(r => r.playlist_id);
}
