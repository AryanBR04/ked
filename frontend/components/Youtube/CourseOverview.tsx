import React from 'react';
import { YoutubePlaylistDetail } from '../../lib/types';

interface CourseOverviewProps {
  course: YoutubePlaylistDetail;
}

const CourseOverview: React.FC<CourseOverviewProps> = ({ course }) => {
  if (!course.course_summary && (!course.skills_tags || course.skills_tags.length === 0)) {
    return null;
  }

  // Extract key topics from lessons (first 4-6 lessons)
  const whatYouWillLearn = course.lessons
    .slice(0, 8)
    .filter(l => l.title.length > 5)
    .map(l => l.title.replace(/^\d+[\s.-]+/, '').replace(/^Lesson\s+\d+[\s:-]+/, '').trim())
    .slice(0, 4);

  return (
    <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Course Summary */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center gap-2 text-moss font-bold uppercase tracking-wider text-sm">
          <span>📖</span>
          Course Overview
        </div>
        <p className="text-ink/70 leading-relaxed text-lg italic bg-white/50 p-6 rounded-2xl border border-white/80 shadow-sm">
          {course.course_summary || "This course provides a detailed exploration of its core topics through high-quality video content."}
        </p>

        {/* Skills Tags */}
        {course.skills_tags && course.skills_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {course.skills_tags.map((tag, idx) => (
              <span 
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1 bg-moss/10 text-moss rounded-full text-xs font-semibold border border-moss/20"
              >
                <span>#</span>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* What You Will Learn */}
      <div className="bg-white/40 p-6 rounded-3xl border border-white/60 backdrop-blur-sm self-start">
        <div className="flex items-center gap-2 text-moss font-bold uppercase tracking-wider text-sm mb-6">
          <span>🎯</span>
          What You Will Learn
        </div>
        <ul className="space-y-4">
          {whatYouWillLearn.length > 0 ? (
            whatYouWillLearn.map((topic, idx) => (
              <li key={idx} className="flex gap-3 text-ink/70 text-sm leading-snug">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-[10px] font-black">
                  ✓
                </span>
                {topic}
              </li>
            ))
          ) : (
            <li className="text-ink/40 text-xs italic">Topics will be extracted as you progress.</li>
          )}
        </ul>
      </div>

      {/* Course Structure (Features 6) */}
      <div className="lg:col-span-3 border-t border-slate-200 pt-8 mt-4">
        <h3 className="text-xl font-bold text-ink mb-6">Course Structure</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {[1, 2, 3, 4].map(i => {
             const lessonsPerModule = Math.ceil(course.lessons.length / 4);
             const moduleStart = (i - 1) * lessonsPerModule;
             const firstLessonInModule = course.lessons[moduleStart];
             if (!firstLessonInModule) return null;
             
             return (
               <div key={i} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                 <div className="text-[10px] font-black uppercase text-secondary/50 mb-1">Module {i}</div>
                 <div className="text-sm font-bold text-ink line-clamp-2">
                    {firstLessonInModule.title.replace(/^\d+[\s.-]+/, '').split(' - ')[0].split(' | ')[0]}
                 </div>
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
};

export default CourseOverview;
