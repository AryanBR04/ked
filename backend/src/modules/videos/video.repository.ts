import { query } from "../../config/db";
import type { VideoContext } from "../../types/domain";

export async function getVideoContextById(videoId: number): Promise<VideoContext | null> {
  const rows = await query<VideoContext[]>(
    `
      SELECT
        vid.id,
        vid.title,
        vid.description,
        vid.youtube_url,
        vid.duration_seconds,
        vid.order_index,
        sec.id AS section_id,
        sec.title AS section_title,
        subj.id AS subject_id,
        subj.title AS subject_title
      FROM videos vid
      INNER JOIN sections sec ON sec.id = vid.section_id
      INNER JOIN subjects subj ON subj.id = sec.subject_id
      WHERE vid.id = ?
        AND subj.is_published = 1
      LIMIT 1
    `,
    [videoId]
  );

  return rows[0] ?? null;
}

