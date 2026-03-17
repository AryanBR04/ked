import { Request, Response } from "express";
import { careerTracksService } from "./career-tracks.service";

export const getCareerTracksController = async (_req: Request, res: Response) => {
  try {
    const tracks = await careerTracksService.getAllTracks();
    res.json({ items: tracks });
  } catch (error) {
    console.error("Error in getCareerTracksController:", error);
    res.status(500).json({ error: "Failed to fetch career tracks" });
  }
};

export const getCareerTrackController = async (req: Request, res: Response) => {
  try {
    const trackId = parseInt(req.params.id as string, 10);
    if (isNaN(trackId)) {
      return res.status(400).json({ error: "Invalid career track ID" });
    }

    const userId = req.user?.id;
    const track = await careerTracksService.getTrackWithSteps(trackId, userId);

    if (!track) {
      return res.status(404).json({ error: "Career track not found" });
    }

    res.json(track);
  } catch (error) {
    console.error("Error in getCareerTrackController:", error);
    res.status(500).json({ error: "Failed to fetch career track" });
  }
};
