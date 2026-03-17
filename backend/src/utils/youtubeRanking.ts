interface RankingInput {
  views: number;
  likes: number;
  publishedDate: Date | string;
  now?: Date;
}

export function calculateRecencyScore(publishedDate: Date | string, now = new Date()) {
  const published = publishedDate instanceof Date ? publishedDate : new Date(publishedDate);

  if (Number.isNaN(published.getTime())) {
    return 0;
  }

  const yearsSinceUpload = Math.max(0, now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return 1 / (yearsSinceUpload + 1);
}

export function calculateQualityScore({
  views,
  likes,
  channelSubscribers,
  publishedDate,
  lessonCount,
  now = new Date()
}: {
  views: number;
  likes: number;
  channelSubscribers: number;
  publishedDate: Date | string;
  lessonCount: number;
  now?: Date;
}) {
  const safeViews = Math.max(views, 1);
  const safeSubscribers = Math.max(channelSubscribers, 1);
  const engagementRatio = views > 0 ? (likes / views) * 100 : 0;
  const recencyScore = calculateRecencyScore(publishedDate, now);
  const lessonCountScore = Math.min(lessonCount / 100, 1);

  const score = (Math.log10(safeViews) * 0.4) +
                (engagementRatio * 0.25) +
                (Math.log10(safeSubscribers) * 0.2) +
                (recencyScore * 0.1) +
                (lessonCountScore * 0.05);

  return Number(score.toFixed(6));
}

export function calculateYoutubeRankingScore(params: RankingInput) {
  const safeViews = Math.max(params.views, 1);
  const safeLikes = Math.max(params.likes, 1);
  const recencyScore = calculateRecencyScore(params.publishedDate, params.now);

  // score = (views * 0.5) + (likes * 0.3) + (recentness * 0.2)
  // We use log10 to normalize the massive range of views/likes
  return Number(
    ((Math.log10(safeViews) * 0.5) + (Math.log10(safeLikes) * 0.3) + (recencyScore * 0.2)).toFixed(6)
  );
}
