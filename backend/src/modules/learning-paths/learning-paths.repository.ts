import { query } from "../../config/db";
import { RowDataPacket } from "mysql2";

export interface LearningPathRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  technology: string;
  difficulty: string;
  created_at: Date;
  updated_at: Date;
}

export interface LearningPathStepRow extends RowDataPacket {
  id: number;
  path_id: number;
  step_order: number;
  step_title: string;
  playlist_id: string;
  created_at: Date;
  updated_at: Date;
}

export const learningPathsRepository = {
  async getAllPaths(): Promise<LearningPathRow[]> {
    const rows = await query<LearningPathRow[]>(
      `SELECT * FROM learning_paths ORDER BY id ASC`
    );
    return rows;
  },

  async getPathById(pathId: number): Promise<LearningPathRow | null> {
    const rows = await query<LearningPathRow[]>(
      `SELECT * FROM learning_paths WHERE id = ?`,
      [pathId]
    );
    return rows.length > 0 ? rows[0] : null;
  },

  async getStepsForPath(pathId: number): Promise<LearningPathStepRow[]> {
    const rows = await query<LearningPathStepRow[]>(
      `SELECT lps.*, yc.title as step_title 
       FROM learning_path_steps lps
       LEFT JOIN youtube_courses yc ON lps.playlist_id = yc.playlist_id
       WHERE lps.path_id = ? 
       ORDER BY lps.step_order ASC`,
      [pathId]
    );
    return rows;
  }
};
