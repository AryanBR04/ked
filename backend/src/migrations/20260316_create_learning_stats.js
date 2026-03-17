const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS learning_stats (
        user_id BIGINT UNSIGNED PRIMARY KEY,
        courses_completed INT DEFAULT 0,
        lessons_completed INT DEFAULT 0,
        total_hours_learned FLOAT DEFAULT 0.0,
        learning_streak INT DEFAULT 0,
        last_activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Database table learning_stats created successfully.');
  } catch (error) {
    console.error('Error creating learning_stats table:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();
