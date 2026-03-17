import { query } from "../../config/db";
import { RowDataPacket } from "mysql2";

export interface CareerTrackRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  estimated_duration: string | null;
  created_at: Date;
}

export interface CareerTrackStepRow extends RowDataPacket {
  id: number;
  track_id: number;
  step_order: number;
  step_title: string;
  learning_path_id: number | null;
  playlist_id: string | null;
}

export const careerTracksRepository = {
  async getAllTracks(): Promise<CareerTrackRow[]> {
    return query<CareerTrackRow[]>(`SELECT * FROM career_tracks ORDER BY id ASC`);
  },

  async getTrackById(trackId: number): Promise<CareerTrackRow | null> {
    const rows = await query<CareerTrackRow[]>(
      `SELECT * FROM career_tracks WHERE id = ?`,
      [trackId]
    );
    return rows.length > 0 ? rows[0] : null;
  },

  async getStepsForTrack(trackId: number): Promise<CareerTrackStepRow[]> {
    return query<CareerTrackStepRow[]>(
      `SELECT * FROM career_track_steps WHERE track_id = ? ORDER BY step_order ASC`,
      [trackId]
    );
  }
};
