import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import {
  addNoteController,
  getLessonNotesController,
  getUserNotesController,
  editNoteController,
  deleteNoteController
} from "./notes.controller";

export const notesRouter = Router();

notesRouter.get("/", requireAuth, getUserNotesController);
notesRouter.post("/", requireAuth, addNoteController);
notesRouter.get("/:playlistId/:videoIndex", requireAuth, getLessonNotesController);
notesRouter.patch("/:noteId", requireAuth, editNoteController);
notesRouter.delete("/:noteId", requireAuth, deleteNoteController);
