import { query } from '../../config/db';
import { ProjectRecord, UserProjectRecord } from '../../types/domain';

export async function listProjectsByTechnology(technology: string): Promise<ProjectRecord[]> {
  return query<ProjectRecord[]>(
    'SELECT * FROM projects WHERE technology = ? ORDER BY difficulty ASC',
    [technology]
  );
}

export async function listProjectsByTechnologies(technologies: string[]): Promise<ProjectRecord[]> {
  if (!technologies.length) return [];
  const placeholders = technologies.map(() => '?').join(', ');
  return query<ProjectRecord[]>(
    `SELECT * FROM projects WHERE technology IN (${placeholders}) ORDER BY technology, difficulty ASC`,
    technologies
  );
}

export async function getProjectById(id: number): Promise<ProjectRecord | null> {
  const results = await query<ProjectRecord[]>(
    'SELECT * FROM projects WHERE id = ?',
    [id]
  );
  return results[0] || null;
}

export async function listUserProjects(userId: number): Promise<(UserProjectRecord & { project_title: string; project_description: string; project_technology: string })[]> {
  return query<any[]>(
    `SELECT up.*, p.title as project_title, p.description as project_description, p.technology as project_technology
     FROM user_projects up
     JOIN projects p ON up.project_id = p.id
     WHERE up.user_id = ?`,
    [userId]
  );
}

export async function getUserProject(userId: number, projectId: number): Promise<UserProjectRecord | null> {
  const results = await query<UserProjectRecord[]>(
    'SELECT * FROM user_projects WHERE user_id = ? AND project_id = ?',
    [userId, projectId]
  );
  return results[0] || null;
}

export async function upsertUserProject(data: {
  userId: number;
  projectId: number;
  status: 'not_started' | 'in_progress' | 'completed';
  githubLink?: string | null;
  projectNotes?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
}): Promise<void> {
  const { userId, projectId, status, githubLink, projectNotes, startedAt, completedAt } = data;
  
  await query(
    `INSERT INTO user_projects (user_id, project_id, status, github_link, project_notes, started_at, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
       status = VALUES(status),
       github_link = VALUES(github_link),
       project_notes = VALUES(project_notes),
       started_at = COALESCE(VALUES(started_at), started_at),
       completed_at = VALUES(completed_at)`,
    [userId, projectId, status, githubLink || null, projectNotes || null, startedAt || null, completedAt || null]
  );
}
export async function listCompletedTechnologies(userId: number): Promise<string[]> {
  const results = await query<{ technology: string }[]>(
    `SELECT DISTINCT technology 
     FROM user_learning_profile 
     WHERE user_id = ? AND courses_completed > 0`,
    [userId]
  );
  return results.map(r => r.technology);
}

export async function countUserProjectsByStatus(userId: number): Promise<{ status: string; count: number }[]> {
  return query<{ status: string; count: number }[]>(
    `SELECT status, COUNT(*) as count 
     FROM user_projects 
     WHERE user_id = ? 
     GROUP BY status`,
    [userId]
  );
}

export async function listAllProjectsGrouped(): Promise<ProjectRecord[]> {
  return query<ProjectRecord[]>(
    'SELECT * FROM projects ORDER BY technology, difficulty ASC'
  );
}
