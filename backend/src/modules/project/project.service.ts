import * as projectRepo from './project.repository';
import { ProjectRecord, UserProjectRecord } from '../../types/domain';
import { AppError } from '../../utils/errors';

export async function getAvailableProjects(technology: string) {
  return projectRepo.listProjectsByTechnology(technology);
}

export async function getProjectDetails(projectId: number) {
  const project = await projectRepo.getProjectById(projectId);
  if (!project) {
    throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found');
  }
  return project;
}

export async function startUserProject(userId: number, projectId: number) {
  const project = await projectRepo.getProjectById(projectId);
  if (!project) {
    throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found');
  }

  await projectRepo.upsertUserProject({
    userId,
    projectId,
    status: 'in_progress',
    startedAt: new Date()
  });

  return { message: 'Project started successfully' };
}

export async function completeUserProject(userId: number, projectId: number, githubLink: string, notes?: string) {
  const existing = await projectRepo.getUserProject(userId, projectId);
  if (!existing) {
    throw new AppError(400, 'PROJECT_NOT_STARTED', 'Project not started yet');
  }

  await projectRepo.upsertUserProject({
    userId,
    projectId,
    status: 'completed',
    githubLink,
    projectNotes: notes || existing.project_notes,
    completedAt: new Date()
  });

  return { message: 'Project completed successfully' };
}

export async function getUserPortfolio(userId: number) {
  const projects = await projectRepo.listUserProjects(userId);
  return projects.filter(p => p.status === 'completed');
}

export async function getProjectStats(userId: number) {
  const counts = await projectRepo.countUserProjectsByStatus(userId);
  return {
    completed: counts.find(c => c.status === 'completed')?.count || 0,
    in_progress: counts.find(c => c.status === 'in_progress')?.count || 0
  };
}

export async function getAllProjects() {
  return projectRepo.listAllProjectsGrouped();
}

export async function getPersonalizedRecommendations(userId: number) {
  const techs = await projectRepo.listCompletedTechnologies(userId);
  if (techs.length === 0) {
    return [];
  }
  return projectRepo.listProjectsByTechnologies(techs);
}

export async function getSuggestedProjects(technology: string, userId?: number) {
  // If specific tech provided (e.g. from course page), return top 3 for that tech
  if (technology && technology !== 'General') {
    const all = await projectRepo.listProjectsByTechnology(technology);
    return all.slice(0, 3);
  }

  // Otherwise, if userId provided, give personalized recommendations
  if (userId) {
    const personalized = await getPersonalizedRecommendations(userId);
    if (personalized.length > 0) {
      return personalized.slice(0, 6);
    }
  }

  // Fallback: return any 3 projects
  const all = await projectRepo.listAllProjectsGrouped();
  return all.slice(0, 3);
}
