import { Router } from "express";
import { getCareerTracksController, getCareerTrackController } from "./career-tracks.controller";
import { optionalAuth } from "../../middleware/optionalAuthMiddleware";

export const careerTracksRouter = Router();

careerTracksRouter.get("/", getCareerTracksController);
careerTracksRouter.get("/:id", optionalAuth, getCareerTrackController);
