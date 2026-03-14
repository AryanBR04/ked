import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import { getVideoForUser } from "./video.service";

const paramsSchema = z.object({
  videoId: z.coerce.number().int().positive()
});

export const getVideoController = asyncHandler(async (request: Request, response: Response) => {
  const { videoId } = paramsSchema.parse(request.params);
  const result = await getVideoForUser(request.user!.id, videoId);
  response.json(result);
});

