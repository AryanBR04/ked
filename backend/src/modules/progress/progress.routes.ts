import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import {
  getSubjectProgressController,
  getVideoProgressController,
  saveVideoProgressController
} from "./progress.controller";

export const progressRouter = Router();

progressRouter.get("/videos/:videoId", requireAuth, getVideoProgressController);
progressRouter.post("/videos/:videoId", requireAuth, saveVideoProgressController);
progressRouter.get("/subjects/:subjectId", requireAuth, getSubjectProgressController);
