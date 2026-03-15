export interface SubjectListItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  category: string | null;
  instructor_name: string | null;
}

export interface SubjectTreeVideo {
  id: number;
  title: string;
  order_index: number;
  duration_seconds: number | null;
  is_completed: boolean;
  locked: boolean;
}

export interface SubjectTreeSection {
  id: number;
  title: string;
  order_index: number;
  videos: SubjectTreeVideo[];
}

export interface SubjectTreeResponse {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  category: string | null;
  instructor_name: string | null;
  sections: SubjectTreeSection[];
}

export interface VideoDetail {
  id: number;
  title: string;
  description: string | null;
  youtube_url: string;
  youtube_embed_url: string | null;
  duration_seconds: number | null;
  order_index: number;
  section_id: number;
  section_title: string;
  subject_id: number;
  subject_title: string;
  previous_video_id: number | null;
  next_video_id: number | null;
  locked: boolean;
  unlock_reason: string | null;
  is_completed: boolean;
}

export interface SubjectProgress {
  total_videos: number;
  completed_videos: number;
  percent_complete: number;
  last_video_id: number | null;
  last_position_seconds: number;
}

export interface VideoProgress {
  last_position_seconds: number;
  is_completed: boolean;
}

export interface YoutubeCourseProgressSummary {
  current_video_index: number;
  completed_videos: number;
  total_videos: number;
  completed_video_indexes: number[];
  percent_complete: number;
  last_watched_at: string | null;
}

export interface YoutubeCourseCardItem {
  playlist_id: string;
  title: string;
  channel_name: string;
  channel_subscribers: number;
  thumbnail: string | null;
  technology: string;
  video_count: number;
  views: number;
  likes: number;
  published_date: string | null;
  ranking_score: number;
  progress: YoutubeCourseProgressSummary | null;
}

export interface YoutubeLesson {
  video_id: string;
  title: string;
  thumbnail: string | null;
  position: number;
  published_at: string | null;
  is_embeddable: boolean | null;
}

export interface YoutubeSearchResponse {
  technology: string;
  sort_by: Array<"date" | "views" | "likes" | "subscribers">;
  source: "cache" | "live" | "stale-cache";
  generated_at: string;
  items: YoutubeCourseCardItem[];
}

export interface YoutubeCourseCollectionResponse {
  source?: "cache" | "live" | "stale-cache";
  generated_at: string;
  items: YoutubeCourseCardItem[];
}

export interface YoutubeTrendingResponse extends YoutubeCourseCollectionResponse {
  source: "cache" | "live" | "stale-cache";
}

export interface YoutubeTechnologiesResponse {
  items: Array<{
    label: string;
    slug: string;
  }>;
}

export interface YoutubePlaylistDetail {
  playlist_id: string;
  title: string;
  channel_name: string;
  thumbnail: string | null;
  technology: string | null;
  video_count: number;
  views: number;
  likes: number;
  published_date: string | null;
  ranking_score: number;
  lessons: YoutubeLesson[];
  progress: YoutubeCourseProgressSummary;
  resume_video_index: number;
}
