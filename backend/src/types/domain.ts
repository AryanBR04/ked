export interface AuthenticatedUser {
  id: number;
  email: string;
  name: string;
}

export interface UserRecord extends AuthenticatedUser {
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface SubjectRecord {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  category: string | null;
  instructor_name: string | null;
  is_published: number;
  created_at: Date;
  updated_at: Date;
}

export interface SectionTreeVideo {
  id: number;
  section_id: number;
  title: string;
  description: string | null;
  youtube_url: string;
  order_index: number;
  duration_seconds: number | null;
}

export interface SectionTreeSection {
  id: number;
  title: string;
  order_index: number;
  videos: SectionTreeVideo[];
}

export interface SubjectTree {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  category: string | null;
  instructor_name: string | null;
  sections: SectionTreeSection[];
}

export interface OrderedVideo {
  id: number;
  title: string;
  section_id: number;
  section_title: string;
  section_order_index: number;
  order_index: number;
}

export interface DecoratedOrderedVideo extends OrderedVideo {
  previous_video_id: number | null;
  next_video_id: number | null;
  locked: boolean;
  unlock_reason: string | null;
  is_completed: boolean;
}

export interface VideoContext {
  id: number;
  title: string;
  description: string | null;
  youtube_url: string;
  duration_seconds: number | null;
  order_index: number;
  section_id: number;
  section_title: string;
  subject_id: number;
  subject_title: string;
}

export interface VideoProgressRecord {
  id: number;
  user_id: number;
  video_id: number;
  last_position_seconds: number;
  is_completed: number;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface RefreshTokenRecord {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
}

export interface YoutubeCourseRecord {
  id: number;
  playlist_id: string;
  title: string;
  channel_name: string;
  channel_id: string | null;
  thumbnail: string | null;
  technology: string;
  video_count: number;
  views: number;
  likes: number;
  channel_subscribers: number;
  published_date: Date | null;
  ranking_score: number;
  quality_score: number;
  course_summary: string | null;
  skills_tags: string | null;
  playlist_items_json: string | null;
  duration_seconds: number;
  difficulty: string;
  cache_expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface YoutubeCourseProgressRecord {
  id: number;
  user_id: number;
  playlist_id: string;
  current_video_index: number;
  completed_videos: number;
  total_videos: number;
  completed_video_indexes_json: string | null;
  last_watched_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CourseNoteRecord {
  id: number;
  user_id: number;
  playlist_id: string;
  video_index: number;
  timestamp_seconds: number;
  note_text: string;
  created_at: Date;
  course_title?: string;
}

export interface UserLearningProfileRecord {
  id: number;
  user_id: number;
  technology: string;
  skill_level: 'Beginner' | 'Intermediate' | 'Advanced';
  courses_completed: number;
  last_updated: Date;
}

export interface ProjectRecord {
  id: number;
  title: string;
  description: string;
  technology: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimated_hours: number;
  steps_json: string | null;
  skills_required_json: string | null;
  created_at: Date;
}

export interface UserProjectRecord {
  id: number;
  user_id: number;
  project_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  github_link: string | null;
  project_notes: string | null;
  started_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}
