SET @add_channel_id_column = (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'youtube_courses'
        AND column_name = 'channel_id'
    ),
    'SELECT 1',
    'ALTER TABLE youtube_courses ADD COLUMN channel_id VARCHAR(120) NULL AFTER channel_name'
  )
);
PREPARE add_channel_id_column_stmt FROM @add_channel_id_column;
EXECUTE add_channel_id_column_stmt;
DEALLOCATE PREPARE add_channel_id_column_stmt;

SET @add_channel_subscribers_column = (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'youtube_courses'
        AND column_name = 'channel_subscribers'
    ),
    'SELECT 1',
    'ALTER TABLE youtube_courses ADD COLUMN channel_subscribers BIGINT UNSIGNED NOT NULL DEFAULT 0 AFTER likes'
  )
);
PREPARE add_channel_subscribers_column_stmt FROM @add_channel_subscribers_column;
EXECUTE add_channel_subscribers_column_stmt;
DEALLOCATE PREPARE add_channel_subscribers_column_stmt;
