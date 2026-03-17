import { Router } from "express";
import { getLearningPathController, getLearningPathsController } from "./learning-paths.controller";
import { optionalAuth } from "../../middleware/optionalAuthMiddleware";

export const learningPathsRouter = Router();

learningPathsRouter.get("/", getLearningPathsController);
learningPathsRouter.get("/:id", optionalAuth, getLearningPathController);
