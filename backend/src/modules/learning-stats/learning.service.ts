import * as learningRepository from "./learning.repository";
import { getDbPool } from "../../config/db";

export async function getUserAnalytics(userId: number) {
  const stats = await learningRepository.getLearningStats(userId);
  
  // Calculate skill progress
  const [skillRows]: any = await getDbPool().query(`
    SELECT yc.technology, SUM(cp.completed_videos) as total_completed, SUM(cp.total_videos) as total_videos
    FROM course_progress cp
    JOIN youtube_courses yc ON cp.playlist_id = yc.playlist_id
    WHERE cp.user_id = ?
    GROUP BY yc.technology
  `, [userId]);

  const skills = skillRows.map((r: any) => ({
    name: r.technology,
    progress: r.total_videos > 0 ? Math.round((r.total_completed / r.total_videos) * 100) : 0
  })).filter((s: any) => s.progress > 0);

  return {
    stats: stats ? {
      courses_completed: Number(stats.courses_completed || 0),
      lessons_completed: Number(stats.lessons_completed || 0),
      total_hours_learned: Number(stats.hours_learned || 0),
      learning_streak: Number(stats.current_streak || 0)
    } : {
      courses_completed: 0,
      lessons_completed: 0,
      total_hours_learned: 0,
      learning_streak: 0
    },
    skills
  };
}

export async function handleLessonCompletion(userId: number, videoDurationSeconds: number, isCourseJustCompleted: boolean) {
  const hoursLearned = videoDurationSeconds / 3600;
  
  await learningRepository.incrementLessonsCompleted(userId, hoursLearned);
  await learningRepository.updateStreak(userId);

  if (isCourseJustCompleted) {
    await learningRepository.incrementCoursesCompleted(userId);
  }
}
