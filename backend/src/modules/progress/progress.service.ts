import { AppError } from "../../utils/errors";
import { decorateVideoSequence } from "../../utils/ordering";
import { capProgressPosition } from "../../utils/progress";
import { getPublishedSubjectById, getSubjectSequence } from "../subjects/subject.repository";
import { getVideoContextById } from "../videos/video.repository";
import {
  getCompletedVideoIdsForSubject,
  getLastWatchedForSubject,
  getVideoProgressRecord,
  upsertVideoProgress
} from "./progress.repository";

export async function getVideoProgress(userId: number, videoId: number) {
  const progress = await getVideoProgressRecord(userId, videoId);

  return {
    last_position_seconds: progress?.last_position_seconds ?? 0,
    is_completed: Boolean(progress?.is_completed ?? 0)
  };
}

export async function saveVideoProgress(
  userId: number,
  videoId: number,
  input: { last_position_seconds: number; is_completed?: boolean }
) {
  const video = await getVideoContextById(videoId);

  if (!video) {
    throw new AppError(404, "VIDEO_NOT_FOUND", "Video not found.");
  }

  const completedVideoIds = new Set(await getCompletedVideoIdsForSubject(userId, video.subject_id));
  const decoratedSequence = decorateVideoSequence(
    await getSubjectSequence(video.subject_id),
    completedVideoIds
  );
  const currentState = decoratedSequence.find((item) => item.id === videoId);

  if (!currentState) {
    throw new AppError(404, "VIDEO_NOT_FOUND", "Video not found in subject sequence.");
  }

  if (currentState.locked) {
    throw new AppError(403, "VIDEO_LOCKED", currentState.unlock_reason ?? "Video is locked.");
  }

  const isCompleted = input.is_completed === true || currentState.is_completed;
  const finalPosition = capProgressPosition(
    input.last_position_seconds,
    video.duration_seconds,
    isCompleted
  );

  await upsertVideoProgress({
    userId,
    videoId,
    lastPositionSeconds: finalPosition,
    isCompleted
  });

  return {
    video_id: videoId,
    last_position_seconds: finalPosition,
    is_completed: isCompleted
  };
}

export async function getSubjectProgress(userId: number, subjectId: number) {
  const subject = await getPublishedSubjectById(subjectId);

  if (!subject) {
    throw new AppError(404, "SUBJECT_NOT_FOUND", "Subject not found.");
  }

  const sequence = await getSubjectSequence(subjectId);
  const completedVideoIds = new Set(await getCompletedVideoIdsForSubject(userId, subjectId));
  const lastWatched = await getLastWatchedForSubject(userId, subjectId);
  const totalVideos = sequence.length;
  const completedVideos = sequence.filter((video) => completedVideoIds.has(video.id)).length;

  return {
    total_videos: totalVideos,
    completed_videos: completedVideos,
    percent_complete: totalVideos === 0 ? 0 : Math.round((completedVideos / totalVideos) * 100),
    last_video_id: lastWatched?.video_id ?? null,
    last_position_seconds: lastWatched?.last_position_seconds ?? 0
  };
}
