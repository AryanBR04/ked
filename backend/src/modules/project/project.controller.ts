import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import * as projectService from "./project.service";

const projectParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

const technologyQuerySchema = z.object({
  tech: z.string().trim().min(1).max(80)
});

const startProjectBodySchema = z.object({
  projectId: z.coerce.number().int().positive()
});

const completeProjectBodySchema = z.object({
  projectId: z.coerce.number().int().positive(),
  githubLink: z.string().url(),
  notes: z.string().optional()
});

export const getAvailableProjectsController = asyncHandler(async (request: Request, response: Response) => {
  const { tech } = technologyQuerySchema.parse(request.query);
  const result = await projectService.getAvailableProjects(tech);
  response.json(result);
});

export const getAllProjectsController = asyncHandler(async (_request: Request, response: Response) => {
  const result = await projectService.getAllProjects();
  response.json(result);
});

export const getProjectDetailsController = asyncHandler(async (request: Request, response: Response) => {
  const { id } = projectParamSchema.parse(request.params);
  const result = await projectService.getProjectDetails(id);
  response.json(result);
});

export const startUserProjectController = asyncHandler(async (request: Request, response: Response) => {
  const { projectId } = startProjectBodySchema.parse(request.body);
  const result = await projectService.startUserProject(request.user!.id, projectId);
  response.json(result);
});

export const completeUserProjectController = asyncHandler(async (request: Request, response: Response) => {
  const { projectId, githubLink, notes } = completeProjectBodySchema.parse(request.body);
  const result = await projectService.completeUserProject(request.user!.id, projectId, githubLink, notes);
  response.json(result);
});

export const getUserPortfolioController = asyncHandler(async (request: Request, response: Response) => {
  // Can be for current user or a specific user id from query
  const paramUserId = request.params.userId;
  const userId = typeof paramUserId === "string" ? parseInt(paramUserId) : request.user!.id;
  const result = await projectService.getUserPortfolio(userId);
  response.json(result);
});

export const getSuggestedProjectsController = asyncHandler(async (request: Request, response: Response) => {
  const tech = request.query.tech as string || 'General';
  const result = await projectService.getSuggestedProjects(tech, request.user?.id);
  response.json(result);
});

export const getProjectStatsController = asyncHandler(async (request: Request, response: Response) => {
  const result = await projectService.getProjectStats(request.user!.id);
  response.json(result);
});

export const getPersonalizedRecommendationsController = asyncHandler(async (request: Request, response: Response) => {
  const result = await projectService.getPersonalizedRecommendations(request.user!.id);
  response.json(result);
});
