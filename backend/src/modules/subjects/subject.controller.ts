import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import { getFirstUnlockedVideo, getSubject, getSubjectList, getSubjectTreeForUser } from "./subject.service";

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(12),
  q: z.string().trim().optional()
});

const paramsSchema = z.object({
  subjectId: z.coerce.number().int().positive()
});

export const listSubjectsController = asyncHandler(async (request: Request, response: Response) => {
  const query = listQuerySchema.parse(request.query);
  const result = await getSubjectList(query);
  response.json(result);
});

export const getSubjectController = asyncHandler(async (request: Request, response: Response) => {
  const { subjectId } = paramsSchema.parse(request.params);
  const result = await getSubject(subjectId);
  response.json(result);
});

export const getSubjectTreeController = asyncHandler(
  async (request: Request, response: Response) => {
    const { subjectId } = paramsSchema.parse(request.params);
    const result = await getSubjectTreeForUser(request.user!.id, subjectId);
    response.json(result);
  }
);

export const getFirstVideoController = asyncHandler(
  async (request: Request, response: Response) => {
    const { subjectId } = paramsSchema.parse(request.params);
    const result = await getFirstUnlockedVideo(request.user!.id, subjectId);
    response.json(result);
  }
);

