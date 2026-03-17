import { careerTracksRepository } from "./career-tracks.repository";
import { query } from "../../config/db";

export interface CareerTrackResponse {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  estimated_duration: string | null;
  steps: {
    id: number;
    step_order: number;
    title: string;
    playlist_id: string | null;
    learning_path_id: number | null;
    is_completed: boolean;
  }[];
  completed_steps: number;
  total_steps: number;
  progress_percentage: number;
}

export const careerTracksService = {
  async getAllTracks() {
    return careerTracksRepository.getAllTracks();
  },

  async getTrackWithSteps(trackId: number, userId?: number): Promise<CareerTrackResponse | null> {
    const track = await careerTracksRepository.getTrackById(trackId);
    if (!track) return null;

    const stepRows = await careerTracksRepository.getStepsForTrack(trackId);

    const steps = stepRows.map(step => ({
      id: step.id,
      step_order: step.step_order,
      title: step.step_title,
      playlist_id: step.playlist_id,
      learning_path_id: step.learning_path_id,
      is_completed: false
    }));

    let completedCount = 0;

    if (userId && steps.length > 0) {
      const playlistSteps = steps.filter(s => s.playlist_id);
      if (playlistSteps.length > 0) {
        const playlistIds = playlistSteps.map(s => s.playlist_id!);
        const placeholders = playlistIds.map(() => "?").join(",");

        const progressRows = await query<any[]>(
          `SELECT playlist_id, completed_videos, total_videos
           FROM course_progress
           WHERE user_id = ? AND playlist_id IN (${placeholders})`,
          [userId, ...playlistIds]
        );

        const completedMap = new Set<string>();
        for (const row of progressRows) {
          if (row.total_videos > 0 && row.completed_videos >= row.total_videos) {
            completedMap.add(row.playlist_id);
          }
        }

        for (const step of steps) {
          if (step.playlist_id && completedMap.has(step.playlist_id)) {
            step.is_completed = true;
            completedCount++;
          }
        }
      }
    }

    const progressPercentage =
      steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

    return {
      id: track.id,
      title: track.title,
      description: track.description,
      difficulty: track.difficulty,
      estimated_duration: track.estimated_duration,
      steps,
      completed_steps: completedCount,
      total_steps: steps.length,
      progress_percentage: progressPercentage
    };
  }
};
