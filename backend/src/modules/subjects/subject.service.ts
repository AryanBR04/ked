import { AppError } from "../../utils/errors";
import { decorateVideoSequence, flattenSubjectVideos } from "../../utils/ordering";
import { getCompletedVideoIdsForSubject, getLastWatchedForSubject } from "../progress/progress.repository";
import {
  getPublishedSubjectById,
  getSubjectSequence,
  getSubjectTreeById,
  listPublishedSubjects
} from "./subject.repository";

export async function getSubjectList(input: { page: number; pageSize: number; q?: string }) {
  const result = await listPublishedSubjects(input);

  return {
    items: result.items.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      thumbnail_url: item.thumbnail_url,
      category: item.category,
      instructor_name: item.instructor_name
    })),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      totalItems: result.total,
      totalPages: Math.max(1, Math.ceil(result.total / input.pageSize))
    }
  };
}

export async function getSubject(subjectId: number) {
  const subject = await getPublishedSubjectById(subjectId);

  if (!subject) {
    throw new AppError(404, "SUBJECT_NOT_FOUND", "Subject not found.");
  }

  return {
    id: subject.id,
    title: subject.title,
    slug: subject.slug,
    description: subject.description,
    thumbnail_url: subject.thumbnail_url,
    category: subject.category,
    instructor_name: subject.instructor_name
  };
}

export async function getSubjectTreeForUser(userId: number, subjectId: number) {
  const tree = await getSubjectTreeById(subjectId);

  if (!tree) {
    throw new AppError(404, "SUBJECT_NOT_FOUND", "Subject not found.");
  }

  const completedVideoIds = new Set(await getCompletedVideoIdsForSubject(userId, subjectId));
  const decoratedSequence = decorateVideoSequence(
    flattenSubjectVideos(tree.sections),
    completedVideoIds
  );
  const stateByVideoId = new Map(decoratedSequence.map((video) => [video.id, video]));

  return {
    id: tree.id,
    title: tree.title,
    slug: tree.slug,
    description: tree.description,
    thumbnail_url: tree.thumbnail_url,
    category: tree.category,
    instructor_name: tree.instructor_name,
    sections: tree.sections.map((section) => ({
      id: section.id,
      title: section.title,
      order_index: section.order_index,
      videos: section.videos.map((video) => {
        const state = stateByVideoId.get(video.id);

        return {
          id: video.id,
          title: video.title,
          order_index: video.order_index,
          duration_seconds: video.duration_seconds,
          is_completed: state?.is_completed ?? false,
          locked: state?.locked ?? false
        };
      })
    }))
  };
}

export async function getFirstUnlockedVideo(userId: number, subjectId: number) {
  const subject = await getPublishedSubjectById(subjectId);

  if (!subject) {
    throw new AppError(404, "SUBJECT_NOT_FOUND", "Subject not found.");
  }

  const completedVideoIds = new Set(await getCompletedVideoIdsForSubject(userId, subjectId));
  const decoratedSequence = decorateVideoSequence(
    await getSubjectSequence(subjectId),
    completedVideoIds
  );
  const lastWatched = await getLastWatchedForSubject(userId, subjectId);
  const resumeVideo = decoratedSequence.find((video) => video.id === lastWatched?.video_id && !video.locked);
  const firstIncompleteUnlocked = decoratedSequence.find((video) => !video.locked && !video.is_completed);
  const fallback = decoratedSequence.find((video) => !video.locked) ?? null;

  return {
    video_id: resumeVideo?.id ?? firstIncompleteUnlocked?.id ?? fallback?.id ?? null
  };
}

