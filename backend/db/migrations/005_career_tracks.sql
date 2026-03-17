CREATE TABLE IF NOT EXISTS career_tracks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(80) NOT NULL DEFAULT 'Beginner',
  estimated_duration VARCHAR(120) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS career_track_steps (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  track_id BIGINT UNSIGNED NOT NULL,
  step_order INT NOT NULL,
  step_title VARCHAR(255) NOT NULL,
  learning_path_id BIGINT UNSIGNED NULL,
  playlist_id VARCHAR(120) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_career_track_steps_track
    FOREIGN KEY (track_id) REFERENCES career_tracks(id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_career_track_steps_order (track_id, step_order),
  KEY idx_career_track_steps_playlist (playlist_id)
);
