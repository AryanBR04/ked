import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import * as controller from "./saved-courses.controller";
import { asyncHandler } from "../../utils/asyncHandler";

export const savedCoursesRouter = Router();

savedCoursesRouter.use(requireAuth);

savedCoursesRouter.post("/toggle", asyncHandler(controller.toggleSavedCourse));
savedCoursesRouter.get("/", asyncHandler(controller.getSavedCourses));
savedCoursesRouter.get("/ids", asyncHandler(controller.getSavedPlaylistIds));
