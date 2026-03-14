import { AppError } from "../../utils/errors";
import { decorateVideoSequence } from "../../utils/ordering";
import { buildYoutubeEmbedUrl } from "../../utils/youtube";
import { getCompletedVideoIdsForSubject } from "../progress/progress.repository";
import { getSubjectSequence } from "../subjects/subject.repository";
import { getVideoContextById } from "./video.repository";

export async function getVideoForUser(userId: number, videoId: number) {
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

  return {
    ...video,
    youtube_embed_url: buildYoutubeEmbedUrl(video.youtube_url),
    previous_video_id: currentState.previous_video_id,
    next_video_id: currentState.next_video_id,
    locked: currentState.locked,
    unlock_reason: currentState.unlock_reason,
    is_completed: currentState.is_completed
  };
}

