import { Request, Response } from "express";
import { learningPathsService } from "./learning-paths.service";

export const getLearningPathsController = async (req: Request, res: Response) => {
  try {
    const paths = await learningPathsService.getAllPaths();
    res.json({ items: paths });
  } catch (error) {
    console.error("Error in getLearningPathsController:", error);
    res.status(500).json({ error: "Failed to fetch learning paths" });
  }
};

export const getLearningPathController = async (req: Request, res: Response) => {
  try {
    const pathId = parseInt(req.params.id as string, 10);
    if (isNaN(pathId)) {
      return res.status(400).json({ error: "Invalid learning path ID format" });
    }

    // user is attached by optionalAuth middleware
    const userId = req.user?.id;

    const path = await learningPathsService.getPathWithSteps(pathId, userId);
    
    if (!path) {
      return res.status(404).json({ error: "Learning path not found" });
    }

    res.json(path);
  } catch (error) {
    console.error("Error in getLearningPathController:", error);
    res.status(500).json({ error: "Failed to fetch learning path" });
  }
};
