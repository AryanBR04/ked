import { Request, Response } from "express";
import * as learningService from "./learning.service";

export async function getAnalytics(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const data = await learningService.getUserAnalytics(userId);
  res.json(data);
}
