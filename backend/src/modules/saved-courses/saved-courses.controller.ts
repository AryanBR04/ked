import { Request, Response } from "express";
import * as service from "./saved-courses.service";

export async function toggleSavedCourse(req: Request, res: Response) {
  const userId = req.user!.id;
  const { playlistId } = req.body;

  if (!playlistId) {
    return res.status(400).json({ message: "Playlist ID is required" });
  }

  const result = await service.toggleSavedCourse(userId, playlistId);
  res.json(result);
}

export async function getSavedCourses(req: Request, res: Response) {
  const userId = req.user!.id;
  const courses = await service.getSavedCourses(userId);
  res.json(courses);
}

export async function getSavedPlaylistIds(req: Request, res: Response) {
  const userId = req.user!.id;
  const ids = await service.getSavedPlaylistIds(userId);
  res.json(ids);
}
