import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import { getSubjectProgress, getVideoProgress, saveVideoProgress } from "./progress.service";

const paramsSchema = z.object({
  videoId: z.coerce.number().int().positive().optional(),
  subjectId: z.coerce.number().int().positive().optional()
});

const saveProgressSchema = z.object({
  last_position_seconds: z.coerce.number().min(0),
  is_completed: z.boolean().optional()
});

export const getVideoProgressController = asyncHandler(
  async (request: Request, response: Response) => {
    const { videoId } = paramsSchema.parse(request.params);
    const result = await getVideoProgress(request.user!.id, videoId!);
    response.json(result);
  }
);

export const saveVideoProgressController = asyncHandler(
  async (request: Request, response: Response) => {
    const { videoId } = paramsSchema.parse(request.params);
    const body = saveProgressSchema.parse(request.body);
    const result = await saveVideoProgress(request.user!.id, videoId!, body);
    response.json(result);
  }
);

export const getSubjectProgressController = asyncHandler(
  async (request: Request, response: Response) => {
    const { subjectId } = paramsSchema.parse(request.params);
    const result = await getSubjectProgress(request.user!.id, subjectId!);
    response.json(result);
  }
);

