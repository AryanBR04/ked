export function getTimeAgo(input: string | Date) {
  const timestamp = input instanceof Date ? input.getTime() : new Date(input).getTime();

  if (Number.isNaN(timestamp)) {
    return "Recently";
  }

  const now = Date.now();
  const diffMilliseconds = Math.max(0, now - timestamp);
  const diffMinutes = Math.floor(diffMilliseconds / (1000 * 60));
  const diffHours = Math.floor(diffMilliseconds / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMilliseconds / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears >= 1) {
    return `${diffYears} ${diffYears === 1 ? "year" : "years"} ago`;
  }

  if (diffMonths >= 1) {
    return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
  }

  if (diffDays >= 1) {
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  }

  if (diffHours >= 1) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  }

  if (diffMinutes >= 1) {
    return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  return "Just now";
}
