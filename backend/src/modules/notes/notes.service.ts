import * as repository from "./notes.repository";
import { AppError } from "../../utils/errors";

export async function addNote(input: {
  userId: number;
  playlistId: string;
  videoIndex: number;
  timestampSeconds: number;
  noteText: string;
}) {
  if (!input.noteText.trim()) {
    throw new AppError(400, "INVALID_NOTE", "Note text cannot be empty.");
  }
  
  return repository.createNote(input);
}

export async function getLessonNotes(userId: number, playlistId: string, videoIndex: number) {
  return repository.getNotesByPlaylistAndVideo(userId, playlistId, videoIndex);
}

export async function getUserNotes(userId: number) {
  return repository.listAllUserNotes(userId);
}

export async function editNote(noteId: number, userId: number, noteText: string) {
  if (!noteText.trim()) {
    throw new AppError(400, "INVALID_NOTE", "Note text cannot be empty.");
  }

  const existing = await repository.getNoteById(noteId, userId);
  if (!existing) {
    throw new AppError(404, "NOTE_NOT_FOUND", "Note not found or access denied.");
  }

  await repository.updateNote(noteId, userId, noteText);
}

export async function removeNote(noteId: number, userId: number) {
  const existing = await repository.getNoteById(noteId, userId);
  if (!existing) {
    throw new AppError(404, "NOTE_NOT_FOUND", "Note not found or access denied.");
  }

  await repository.deleteNote(noteId, userId);
}
