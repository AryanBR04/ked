import type { DecoratedOrderedVideo, OrderedVideo, SectionTreeSection } from "../types/domain";

export function flattenSubjectVideos(sections: SectionTreeSection[]): OrderedVideo[] {
  return [...sections]
    .sort((left, right) => left.order_index - right.order_index)
    .flatMap((section) =>
      [...section.videos]
        .sort((left, right) => left.order_index - right.order_index)
        .map((video) => ({
          id: video.id,
          title: video.title,
          section_id: section.id,
          section_title: section.title,
          section_order_index: section.order_index,
          order_index: video.order_index
        }))
    );
}

export function decorateVideoSequence(
  videos: OrderedVideo[],
  completedVideoIds: Set<number>
): DecoratedOrderedVideo[] {
  return videos.map((video, index) => {
    const previous = index > 0 ? videos[index - 1] : null;
    const next = index < videos.length - 1 ? videos[index + 1] : null;
    const isCompleted = completedVideoIds.has(video.id);
    const locked = previous !== null && !completedVideoIds.has(previous.id);

    return {
      ...video,
      previous_video_id: previous?.id ?? null,
      next_video_id: next?.id ?? null,
      locked,
      unlock_reason: locked ? "Complete the previous video to unlock this lesson." : null,
      is_completed: isCompleted
    };
  });
}

