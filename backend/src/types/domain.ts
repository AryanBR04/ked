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

