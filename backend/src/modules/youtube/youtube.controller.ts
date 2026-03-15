import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  getContinueLearningYoutubeCourses,
  getNewestYoutubeCourses,
  getRecommendedYoutubeCourses,
  getTrendingYoutubeCourses,
  getYoutubePlaylistDetail,
  getYoutubePlaylistProgress,
  listYoutubeTechnologies,
  saveYoutubePlaylistProgress,
  searchYoutubeCourses
} from "./youtube.service";

const searchQuerySchema = z.object({
  tech: z.string().trim().min(1).max(80),
  sortBy: z.union([z.string(), z.array(z.string())]).optional()
});

const trendingQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(20).default(8)
});

const listQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(20).default(8)
});

const playlistParamsSchema = z.object({
  playlistId: z.string().trim().min(8).max(80)
});

const saveProgressBodySchema = z.object({
  current_video_index: z.coerce.number().int().min(0),
  total_videos: z.coerce.number().int().min(0),
  completed_video_index: z.coerce.number().int().min(0).optional()
});

export const listYoutubeTechnologiesController = asyncHandler(async (_request: Request, response: Response) => {
  response.json(listYoutubeTechnologies());
});

export const searchYoutubeCoursesController = asyncHandler(async (request: Request, response: Response) => {
  const { tech, sortBy } = searchQuerySchema.parse(request.query);
  const result = await searchYoutubeCourses(tech, request.user?.id, sortBy);
  response.json(result);
});

export const getTrendingYoutubeCoursesController = asyncHandler(
  async (request: Request, response: Response) => {
    const { limit } = trendingQuerySchema.parse(request.query);
    const result = await getTrendingYoutubeCourses(limit, request.user?.id);
    response.json(result);
  }
);

export const getContinueLearningYoutubeCoursesController = asyncHandler(
  async (request: Request, response: Response) => {
    const { limit } = listQuerySchema.parse(request.query);
    const result = await getContinueLearningYoutubeCourses(request.user?.id, limit);
    response.json(result);
  }
);

export const getRecommendedYoutubeCoursesController = asyncHandler(
  async (request: Request, response: Response) => {
    const { limit } = listQuerySchema.parse(request.query);
    const result = await getRecommendedYoutubeCourses(limit, request.user?.id);
    response.json(result);
  }
);

export const getNewestYoutubeCoursesController = asyncHandler(
  async (request: Request, response: Response) => {
    const { limit } = listQuerySchema.parse(request.query);
    const result = await getNewestYoutubeCourses(limit, request.user?.id);
    response.json(result);
  }
);

export const getYoutubePlaylistController = asyncHandler(async (request: Request, response: Response) => {
  const { playlistId } = playlistParamsSchema.parse(request.params);
  const result = await getYoutubePlaylistDetail(request.user!.id, playlistId);
  response.json(result);
});

export const getYoutubePlaylistProgressController = asyncHandler(
  async (request: Request, response: Response) => {
    const { playlistId } = playlistParamsSchema.parse(request.params);
    const result = await getYoutubePlaylistProgress(request.user!.id, playlistId);
    response.json(result);
  }
);

export const saveYoutubePlaylistProgressController = asyncHandler(
  async (request: Request, response: Response) => {
    const { playlistId } = playlistParamsSchema.parse(request.params);
    const body = saveProgressBodySchema.parse(request.body);
    const result = await saveYoutubePlaylistProgress(request.user!.id, playlistId, body);
    response.json(result);
  }
);
