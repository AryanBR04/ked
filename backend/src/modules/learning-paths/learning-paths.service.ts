import { learningPathsRepository, LearningPathRow } from "./learning-paths.repository";
import { query } from "../../config/db";

export interface LearningPathResponse {
  id: number;
  title: string;
  description: string;
  technology: string;
  difficulty: string;
  steps: {
    id: number;
    step_order: number;
    title: string;
    playlist_id: string;
    is_completed: boolean;
  }[];
  progress_percentage: number;
}

export const learningPathsService = {
  async getAllPaths() {
    return learningPathsRepository.getAllPaths();
  },

  async getPathWithSteps(pathId: number, userId?: number): Promise<LearningPathResponse | null> {
    const path = await learningPathsRepository.getPathById(pathId);
    if (!path) return null;

    const stepsRows = await learningPathsRepository.getStepsForPath(pathId);
    
    // Default steps structure before applying user progress
    const steps = stepsRows.map(step => ({
      id: step.id,
      step_order: step.step_order,
      title: step.step_title || `Step ${step.step_order}`,
      playlist_id: step.playlist_id,
      is_completed: false
    }));

    let progressPercentage = 0;

    // If user is authenticated, query course_progress to mark steps as completed
    if (userId && steps.length > 0) {
      const playlistIds = steps.map(s => s.playlist_id);
      
      if (playlistIds.length > 0) {
        // Query to check if the user has completed any of these playlists.
        // We consider a playlist complete if completed_videos >= total_videos and total_videos > 0
        // Or if there's a specific "is_completed" flag if the schema has it.
        // Let's use the assumption: completed_videos >= total_videos and total_videos > 0
        const placeholders = playlistIds.map(() => '?').join(',');
        
        const progressRows = await query<any[]>(
          `SELECT playlist_id, completed_videos, total_videos 
           FROM course_progress 
           WHERE user_id = ? AND playlist_id IN (${placeholders})`,
          [userId, ...playlistIds]
        );

        const completedMap = new Map<string, boolean>();
        for (const row of progressRows) {
          if (row.total_videos > 0 && row.completed_videos >= row.total_videos) {
            completedMap.set(row.playlist_id, true);
          }
        }

        let completedCount = 0;
        for (const step of steps) {
          if (completedMap.get(step.playlist_id)) {
            step.is_completed = true;
            completedCount++;
          }
        }

        if (steps.length > 0) {
          progressPercentage = Math.round((completedCount / steps.length) * 100);
        }
      }
    }

    return {
      id: path.id,
      title: path.title,
      description: path.description,
      technology: path.technology,
      difficulty: path.difficulty,
      steps,
      progress_percentage: progressPercentage
    };
  }
};
