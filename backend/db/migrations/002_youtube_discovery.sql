CREATE TABLE IF NOT EXISTS youtube_courses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  playlist_id VARCHAR(120) NOT NULL,
  title VARCHAR(255) NOT NULL,
  channel_name VARCHAR(255) NOT NULL,
  thumbnail VARCHAR(500) NULL,
  technology VARCHAR(120) NOT NULL,
  video_count INT NOT NULL DEFAULT 0,
  views BIGINT UNSIGNED NOT NULL DEFAULT 0,
  likes BIGINT UNSIGNED NOT NULL DEFAULT 0,
  published_date DATETIME NULL DEFAULT NULL,
  ranking_score DECIMAL(12, 6) NOT NULL DEFAULT 0,
  playlist_items_json LONGTEXT NULL,
  cache_expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_youtube_courses_playlist_technology (playlist_id, technology),
  KEY idx_youtube_courses_playlist (playlist_id),
  KEY idx_youtube_courses_technology_cache (technology, cache_expires_at),
  KEY idx_youtube_courses_ranking (ranking_score)
);

CREATE TABLE IF NOT EXISTS course_progress (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  playlist_id VARCHAR(120) NOT NULL,
  current_video_index INT NOT NULL DEFAULT 0,
  completed_videos INT NOT NULL DEFAULT 0,
  total_videos INT NOT NULL DEFAULT 0,
  completed_video_indexes_json LONGTEXT NULL,
  last_watched_at DATETIME NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_course_progress_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_course_progress_user_playlist (user_id, playlist_id),
  KEY idx_course_progress_playlist (playlist_id),
  KEY idx_course_progress_last_watched (last_watched_at)
);
