export const YOUTUBE_SORT_OPTIONS = [
  {
    value: "date",
    label: "Newest"
  },
  {
    value: "views",
    label: "Most Viewed"
  },
  {
    value: "likes",
    label: "Most Liked"
  },
  {
    value: "subscribers",
    label: "Most Subscribers"
  }
] as const;

export type YoutubeSortKey = typeof YOUTUBE_SORT_OPTIONS[number]["value"];
