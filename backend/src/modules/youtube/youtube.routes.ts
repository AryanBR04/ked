import { Router } from "express";
import { optionalAuth } from "../../middleware/optionalAuthMiddleware";
import { requireAuth } from "../../middleware/authMiddleware";
import {
  getContinueLearningYoutubeCoursesController,
  getNewestYoutubeCoursesController,
  getRecommendedYoutubeCoursesController,
  getTrendingYoutubeCoursesController,
  getYoutubePlaylistController,
  getYoutubePlaylistProgressController,
  listYoutubeTechnologiesController,
  saveYoutubePlaylistProgressController,
  searchYoutubeCoursesController
} from "./youtube.controller";

export const youtubeRouter = Router();

youtubeRouter.get("/technologies", listYoutubeTechnologiesController);
youtubeRouter.get("/search", optionalAuth, searchYoutubeCoursesController);
youtubeRouter.get("/continue-learning", optionalAuth, getContinueLearningYoutubeCoursesController);
youtubeRouter.get("/trending", optionalAuth, getTrendingYoutubeCoursesController);
youtubeRouter.get("/recommended", optionalAuth, getRecommendedYoutubeCoursesController);
youtubeRouter.get("/new", optionalAuth, getNewestYoutubeCoursesController);
youtubeRouter.get("/playlists/:playlistId", requireAuth, getYoutubePlaylistController);
youtubeRouter.get("/playlists/:playlistId/progress", requireAuth, getYoutubePlaylistProgressController);
youtubeRouter.post("/playlists/:playlistId/progress", requireAuth, saveYoutubePlaylistProgressController);
