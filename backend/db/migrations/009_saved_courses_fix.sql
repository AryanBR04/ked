-- Add unique constraint to prevent duplicate saved courses
ALTER TABLE saved_courses
ADD UNIQUE KEY unique_user_course (user_id, playlist_id);
