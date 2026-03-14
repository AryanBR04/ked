import { query } from "../../config/db";
import type { OrderedVideo, SectionTreeSection, SubjectRecord, SubjectTree } from "../../types/domain";

interface SubjectTreeRow {
  subject_id: number;
  subject_title: string;
  subject_slug: string;
  subject_description: string;
  subject_thumbnail_url: string | null;
  subject_category: string | null;
  subject_instructor_name: string | null;
  section_id: number | null;
  section_title: string | null;
  section_order_index: number | null;
  video_id: number | null;
  video_title: string | null;
  video_description: string | null;
  video_youtube_url: string | null;
  video_order_index: number | null;
  video_duration_seconds: number | null;
}

interface SequenceRow {
  id: number;
  title: string;
  section_id: number;
  section_title: string;
  section_order_index: number;
  order_index: number;
}

export async function listPublishedSubjects(input: {
  page: number;
  pageSize: number;
  q?: string;
}) {
  const offset = (input.page - 1) * input.pageSize;
  const hasQuery = Boolean(input.q?.trim());
  const search = `%${input.q?.trim() ?? ""}%`;

  const whereClause = hasQuery
    ? "WHERE is_published = 1 AND (title LIKE ? OR description LIKE ? OR instructor_name LIKE ?)"
    : "WHERE is_published = 1";

  const rows = await query<SubjectRecord[]>(
    `
      SELECT id, title, slug, description, thumbnail_url, category, instructor_name, is_published, created_at, updated_at
      FROM subjects
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `,
    hasQuery ? [search, search, search, input.pageSize, offset] : [input.pageSize, offset]
  );

  const countRows = await query<Array<{ total: number }>>(
    `
      SELECT COUNT(*) AS total
      FROM subjects
      ${whereClause}
    `,
    hasQuery ? [search, search, search] : []
  );

  return {
    items: rows,
    total: countRows[0]?.total ?? 0
  };
}

export async function getPublishedSubjectById(subjectId: number): Promise<SubjectRecord | null> {
  const rows = await query<SubjectRecord[]>(
    `
      SELECT id, title, slug, description, thumbnail_url, category, instructor_name, is_published, created_at, updated_at
      FROM subjects
      WHERE id = ?
        AND is_published = 1
      LIMIT 1
    `,
    [subjectId]
  );

  return rows[0] ?? null;
}

export async function getSubjectTreeById(subjectId: number): Promise<SubjectTree | null> {
  const rows = await query<SubjectTreeRow[]>(
    `
      SELECT
        subj.id AS subject_id,
        subj.title AS subject_title,
        subj.slug AS subject_slug,
        subj.description AS subject_description,
        subj.thumbnail_url AS subject_thumbnail_url,
        subj.category AS subject_category,
        subj.instructor_name AS subject_instructor_name,
        sec.id AS section_id,
        sec.title AS section_title,
        sec.order_index AS section_order_index,
        vid.id AS video_id,
        vid.title AS video_title,
        vid.description AS video_description,
        vid.youtube_url AS video_youtube_url,
        vid.order_index AS video_order_index,
        vid.duration_seconds AS video_duration_seconds
      FROM subjects subj
      LEFT JOIN sections sec ON sec.subject_id = subj.id
      LEFT JOIN videos vid ON vid.section_id = sec.id
      WHERE subj.id = ?
        AND subj.is_published = 1
      ORDER BY sec.order_index ASC, vid.order_index ASC
    `,
    [subjectId]
  );

  if (!rows.length) {
    return null;
  }

  const first = rows[0];
  const sectionMap = new Map<number, SectionTreeSection>();

  for (const row of rows) {
    if (!row.section_id || !row.section_title || row.section_order_index === null) {
      continue;
    }

    if (!sectionMap.has(row.section_id)) {
      sectionMap.set(row.section_id, {
        id: row.section_id,
        title: row.section_title,
        order_index: row.section_order_index,
        videos: []
      });
    }

    if (!row.video_id || !row.video_title || !row.video_youtube_url || row.video_order_index === null) {
      continue;
    }

    sectionMap.get(row.section_id)?.videos.push({
      id: row.video_id,
      section_id: row.section_id,
      title: row.video_title,
      description: row.video_description,
      youtube_url: row.video_youtube_url,
      order_index: row.video_order_index,
      duration_seconds: row.video_duration_seconds
    });
  }

  return {
    id: first.subject_id,
    title: first.subject_title,
    slug: first.subject_slug,
    description: first.subject_description,
    thumbnail_url: first.subject_thumbnail_url,
    category: first.subject_category,
    instructor_name: first.subject_instructor_name,
    sections: Array.from(sectionMap.values())
  };
}

export async function getSubjectSequence(subjectId: number): Promise<OrderedVideo[]> {
  const rows = await query<SequenceRow[]>(
    `
      SELECT
        vid.id,
        vid.title,
        sec.id AS section_id,
        sec.title AS section_title,
        sec.order_index AS section_order_index,
        vid.order_index
      FROM subjects subj
      INNER JOIN sections sec ON sec.subject_id = subj.id
      INNER JOIN videos vid ON vid.section_id = sec.id
      WHERE subj.id = ?
        AND subj.is_published = 1
      ORDER BY sec.order_index ASC, vid.order_index ASC
    `,
    [subjectId]
  );

  return rows;
}

