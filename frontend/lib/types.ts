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

