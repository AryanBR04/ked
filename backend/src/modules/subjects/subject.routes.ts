import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import {
  getFirstVideoController,
  getSubjectController,
  getSubjectTreeController,
  listSubjectsController
} from "./subject.controller";

export const subjectRouter = Router();

subjectRouter.get("/", listSubjectsController);
subjectRouter.get("/:subjectId", getSubjectController);
subjectRouter.get("/:subjectId/tree", requireAuth, getSubjectTreeController);
subjectRouter.get("/:subjectId/first-video", requireAuth, getFirstVideoController);
