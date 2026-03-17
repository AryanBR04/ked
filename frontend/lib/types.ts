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
  quality_score: number;
  course_summary: string | null;
  skills_tags: string[] | null;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | null;
  progress: YoutubeCourseProgressSummary | null;
  is_saved?: boolean;
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
  quality_score: number;
  course_summary: string | null;
  skills_tags: string[] | null;
  duration_seconds: number | null;
  difficulty: string | null;
  lessons: YoutubeLesson[];
  progress: YoutubeCourseProgressSummary;
  resume_video_index: number;
}

export interface CourseNote {
  id: number;
  user_id: number;
  playlist_id: string;
  video_index: number;
  timestamp_seconds: number;
  note_text: string;
  created_at: string;
  course_title?: string;
}

export interface UserLearningProfile {
  id: number;
  user_id: number;
  technology: string;
  skill_level: 'Beginner' | 'Intermediate' | 'Advanced';
  courses_completed: number;
  last_updated: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  technology: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimated_hours: number;
  steps_json: string | null;
  skills_required_json: string | null;
  created_at: string;
}

export interface UserProject {
  id: number;
  user_id: number;
  project_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  github_link: string | null;
  project_notes: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  project_title?: string;
  project_description?: string;
  project_technology?: string;
}
