const mysql = require('mysql2/promise');
require('dotenv').config();

async function testStats() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    const [users] = await connection.query('SELECT id FROM users LIMIT 1');
    if (users.length === 0) {
      console.log('No users found to test with.');
      return;
    }
    const userId = users[0].id;
    console.log(`Testing with user ID: ${userId}`);

    const duration = 600; // 10 minutes
    const hours = duration / 3600;
    
    console.log('Simulating lesson completion...');
    await connection.query(`
      INSERT INTO learning_stats (user_id, lessons_completed, hours_learned, current_streak, last_activity_at)
      VALUES (?, 1, ?, 1, NOW())
      ON DUPLICATE KEY UPDATE
        lessons_completed = lessons_completed + 1,
        hours_learned = hours_learned + ?,
        current_streak = 1,
        last_activity_at = NOW()
    `, [userId, hours, hours]);

    const [stats] = await connection.query('SELECT * FROM learning_stats WHERE user_id = ?', [userId]);
    console.log('Current stats:', JSON.stringify(stats[0], null, 2));

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await connection.end();
  }
}

testStats();
