import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import { getVideoController } from "./video.controller";

export const videoRouter = Router();

videoRouter.get("/:videoId", requireAuth, getVideoController);

