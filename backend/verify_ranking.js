const mysql = require('mysql2/promise');
require('dotenv').config();

async function verify() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('--- Verifying Database Column ---');
  const [columns] = await connection.query('DESCRIBE youtube_courses');
  const qualityScoreCol = columns.find(c => c.Field === 'quality_score');
  if (qualityScoreCol) {
    console.log('✅ quality_score column exists');
  } else {
    console.error('❌ quality_score column MISSING');
  }

  console.log('\n--- Checking Quality Scores ---');
  const [courses] = await connection.query('SELECT title, quality_score, views, likes, channel_subscribers, video_count FROM youtube_courses ORDER BY quality_score DESC LIMIT 5');
  
  if (courses.length === 0) {
    console.log('No courses found in database yet. Refreshing cache might be needed.');
  } else {
    courses.forEach((c, i) => {
      console.log(`${i+1}. ${c.title} - Score: ${c.quality_score}`);
      console.log(`   Views: ${c.views}, Likes: ${c.likes}, Subs: ${c.channel_subscribers}, Lessons: ${c.video_count}`);
    });
  }

  process.exit(0);
}

verify().catch(e => {
  console.error(e);
  process.exit(1);
});
