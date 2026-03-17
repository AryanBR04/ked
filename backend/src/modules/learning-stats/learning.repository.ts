import { getDbPool } from "../../config/db";

export async function getLearningStats(userId: number) {
  const [rows]: any = await getDbPool().query(
    "SELECT * FROM learning_stats WHERE user_id = ?",
    [userId]
  );
  return rows[0] || null;
}

export async function upsertLearningStats(stats: {
  userId: number;
  coursesCompleted?: number;
  lessonsCompleted?: number;
  hoursLearned?: number;
  currentStreak?: number;
  lastActivityAt?: Date;
}) {
  const query = `
    INSERT INTO learning_stats (
      user_id, courses_completed, lessons_completed, hours_learned, current_streak, last_activity_at
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      courses_completed = COALESCE(?, courses_completed),
      lessons_completed = COALESCE(?, lessons_completed),
      hours_learned = COALESCE(?, hours_learned),
      current_streak = COALESCE(?, current_streak),
      last_activity_at = COALESCE(?, last_activity_at)
  `;
  
  const values = [
    stats.userId, 
    stats.coursesCompleted ?? 0, 
    stats.lessonsCompleted ?? 0, 
    stats.hoursLearned ?? 0, 
    stats.currentStreak ?? 0, 
    stats.lastActivityAt ?? new Date(),
    stats.coursesCompleted ?? null,
    stats.lessonsCompleted ?? null,
    stats.hoursLearned ?? null,
    stats.currentStreak ?? null,
    stats.lastActivityAt ?? null
  ];

  await getDbPool().query(query, values);
}

export async function incrementLessonsCompleted(userId: number, hoursToAdd: number) {
  const query = `
    INSERT INTO learning_stats (user_id, lessons_completed, hours_learned, last_activity_at)
    VALUES (?, 1, ?, NOW())
    ON DUPLICATE KEY UPDATE
      lessons_completed = lessons_completed + 1,
      hours_learned = hours_learned + ?,
      last_activity_at = NOW()
  `;
  await getDbPool().query(query, [userId, hoursToAdd, hoursToAdd]);
}

export async function incrementCoursesCompleted(userId: number) {
  const query = `
    UPDATE learning_stats SET courses_completed = courses_completed + 1 WHERE user_id = ?
  `;
  await getDbPool().query(query, [userId]);
}

export async function updateStreak(userId: number) {
  const stats = await getLearningStats(userId);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!stats) {
    await upsertLearningStats({ userId, currentStreak: 1, lastActivityAt: now });
    return;
  }

  const lastActivity = new Date(stats.last_activity_at);
  const lastActivityDay = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());

  const diffTime = Math.abs(today.getTime() - lastActivityDay.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Already studied today
    return;
  } else if (diffDays === 1) {
    // Continuous streak
    await getDbPool().query(
      "UPDATE learning_stats SET current_streak = current_streak + 1, last_activity_at = NOW() WHERE user_id = ?",
      [userId]
    );
  } else {
    // Streak broken
    await getDbPool().query(
      "UPDATE learning_stats SET current_streak = 1, last_activity_at = NOW() WHERE user_id = ?",
      [userId]
    );
  }
}
