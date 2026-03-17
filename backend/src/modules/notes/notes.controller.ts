import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import * as service from "./notes.service";

const addNoteSchema = z.object({
  playlistId: z.string().trim().min(8).max(80),
  videoIndex: z.coerce.number().int().min(0),
  timestampSeconds: z.coerce.number().int().min(0),
  noteText: z.string().trim().min(1).max(2000)
});

const editNoteSchema = z.object({
  noteText: z.string().trim().min(1).max(2000)
});

export const addNoteController = asyncHandler(async (request: Request, response: Response) => {
  const body = addNoteSchema.parse(request.body);
  const noteId = await service.addNote({
    userId: request.user!.id,
    ...body
  });
  response.status(201).json({ id: noteId });
});

export const getLessonNotesController = asyncHandler(async (request: Request, response: Response) => {
  const playlistId = z.string().parse(request.params.playlistId);
  const videoIndex = z.coerce.number().int().parse(request.params.videoIndex);
  
  const notes = await service.getLessonNotes(request.user!.id, playlistId, videoIndex);
  response.json(notes);
});

export const getUserNotesController = asyncHandler(async (request: Request, response: Response) => {
  const notes = await service.getUserNotes(request.user!.id);
  response.json(notes);
});

export const editNoteController = asyncHandler(async (request: Request, response: Response) => {
  const noteId = z.coerce.number().int().parse(request.params.noteId);
  const { noteText } = editNoteSchema.parse(request.body);
  
  await service.editNote(noteId, request.user!.id, noteText);
  response.json({ success: true });
});

export const deleteNoteController = asyncHandler(async (request: Request, response: Response) => {
  const noteId = z.coerce.number().int().parse(request.params.noteId);
  
  await service.removeNote(noteId, request.user!.id);
  response.json({ success: true });
});
