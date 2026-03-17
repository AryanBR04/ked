CREATE TABLE IF NOT EXISTS learning_paths (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  technology VARCHAR(120) NOT NULL,
  difficulty VARCHAR(50) NOT NULL DEFAULT 'Beginner',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_learning_paths_technology (technology)
);

CREATE TABLE IF NOT EXISTS learning_path_steps (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  path_id BIGINT UNSIGNED NOT NULL,
  step_order INT NOT NULL,
  step_title VARCHAR(255) NOT NULL,
  playlist_id VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_learning_path_steps_path
    FOREIGN KEY (path_id) REFERENCES learning_paths(id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_learning_path_steps_path_order (path_id, step_order),
  KEY idx_learning_path_steps_playlist (playlist_id)
);
