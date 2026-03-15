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

export function calculateYoutubeRankingScore({
  views,
  likes,
  publishedDate,
  now = new Date()
}: RankingInput) {
  const safeViews = Math.max(views, 1);
  const engagementRatio = views > 0 ? (likes / views) * 100 : 0;
  const recencyScore = calculateRecencyScore(publishedDate, now);

  return Number(
    ((Math.log10(safeViews) * 0.5) + (engagementRatio * 0.3) + (recencyScore * 0.2)).toFixed(6)
  );
}
