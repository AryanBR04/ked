import { execute, query } from "../../config/db";
import type { CourseNoteRecord } from "../../types/domain";

export async function createNote(input: {
  userId: number;
  playlistId: string;
  videoIndex: number;
  timestampSeconds: number;
  noteText: string;
}) {
  const result = await execute(
    `
      INSERT INTO course_notes (
        user_id,
        playlist_id,
        video_index,
        timestamp_seconds,
        note_text
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      input.userId,
      input.playlistId,
      input.videoIndex,
      input.timestampSeconds,
      input.noteText
    ]
  );
  return result.insertId;
}

export async function getNotesByPlaylistAndVideo(userId: number, playlistId: string, videoIndex: number) {
  return query<CourseNoteRecord[]>(
    `
      SELECT id, user_id, playlist_id, video_index, timestamp_seconds, note_text, created_at
      FROM course_notes
      WHERE user_id = ? AND playlist_id = ? AND video_index = ?
      ORDER BY timestamp_seconds ASC
    `,
    [userId, playlistId, videoIndex]
  );
}

export async function listAllUserNotes(userId: number) {
  return query<CourseNoteRecord[]>(
    `
      SELECT 
        cn.id, 
        cn.user_id, 
        cn.playlist_id, 
        cn.video_index, 
        cn.timestamp_seconds, 
        cn.note_text, 
        cn.created_at,
        yc.title AS course_title
      FROM course_notes cn
      JOIN youtube_courses yc ON cn.playlist_id = yc.playlist_id
      WHERE cn.user_id = ?
      ORDER BY cn.created_at DESC
    `,
    [userId]
  );
}

export async function updateNote(noteId: number, userId: number, noteText: string) {
  await execute(
    `
      UPDATE course_notes
      SET note_text = ?
      WHERE id = ? AND user_id = ?
    `,
    [noteText, noteId, userId]
  );
}

export async function deleteNote(noteId: number, userId: number) {
  await execute(
    `
      DELETE FROM course_notes
      WHERE id = ? AND user_id = ?
    `,
    [noteId, userId]
  );
}

export async function getNoteById(noteId: number, userId: number) {
  const rows = await query<CourseNoteRecord[]>(
    `
      SELECT id, user_id, playlist_id, video_index, timestamp_seconds, note_text, created_at
      FROM course_notes
      WHERE id = ? AND user_id = ?
    `,
    [noteId, userId]
  );
  return rows[0] ?? null;
}
