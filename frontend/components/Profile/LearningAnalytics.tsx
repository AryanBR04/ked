import React from "react";
import { StatsCard } from "./StatsCard";
import { SkillGraph } from "./SkillGraph";

interface AnalyticsData {
  stats: {
    courses_completed: number;
    lessons_completed: number;
    total_hours_learned: number;
    learning_streak: number;
  };
  skills: {
    name: string;
    progress: number;
  }[];
}

interface LearningAnalyticsProps {
  data: AnalyticsData;
}

export function LearningAnalytics({ data }: LearningAnalyticsProps) {
  const { stats, skills } = data;

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Learning Analytics</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            label="Courses Completed" 
            value={stats.courses_completed} 
          />
          <StatsCard 
            label="Lessons Completed" 
            value={stats.lessons_completed} 
          />
          <StatsCard 
            label="Hours Learned" 
            value={Number(data.stats.total_hours_learned || 0).toFixed(1)} 
            unit="hrs"
          />
          <StatsCard 
            label="Learning Streak" 
            value={stats.learning_streak} 
            unit="days"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flame">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
              </svg>
            }
          />
        </div>
      </section>

      {skills.length > 0 && <SkillGraph skills={skills} />}
    </div>
  );
}
