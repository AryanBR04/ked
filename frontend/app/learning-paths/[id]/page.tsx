"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { publicApiFetch, apiFetchMaybeAuth } from "@/lib/apiClient";
import { Button } from "@/components/common/Button";
import Link from "next/link";

interface Step {
  id: number;
  step_order: number;
  title: string;
  playlist_id: string;
  is_completed: boolean;
}

interface LearningPath {
  id: number;
  title: string;
  description: string;
  technology: string;
  difficulty: string;
  steps: Step[];
  progress_percentage: number;
}

export default function LearningPathDetailsPage() {
  const { id } = useParams();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await apiFetchMaybeAuth<LearningPath>(`/learning-paths/${id}`);
        setPath(data);
      } catch (err) {
        console.error("Failed to fetch learning path:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="p-20 text-center">Loading learning journey...</div>;
  if (!path) return <div className="p-20 text-center text-rose-500">Learning path not found.</div>;

  return (
    <main className="container mx-auto max-w-5xl px-4 py-12 md:px-6">
      <div className="space-y-12">
        <header className="space-y-6 text-center md:text-left">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <span className="rounded-full bg-moss/10 px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-moss">
              {path.technology}
            </span>
            <span className="rounded-full bg-ink/5 px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-ink/60">
              {path.difficulty}
            </span>
            {path.progress_percentage > 0 && (
              <span className="rounded-full bg-moss px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-white shadow-soft">
                {path.progress_percentage}% COMPLETED
              </span>
            )}
          </div>
          <h1 className="text-4xl font-serif text-ink md:text-5xl lg:text-7xl leading-[0.95] tracking-tight">
            {path.title}
          </h1>
          <p className="mx-auto md:mx-0 max-w-2xl text-xl leading-relaxed text-ink/65">
            {path.description}
          </p>
        </header>

        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-ink/10 pb-4">
            <h2 className="text-2xl font-semibold">Journey Roadmap</h2>
            <span className="text-sm font-medium text-ink/45">{path.steps.length} Milestones</span>
          </div>
          
          <div className="grid gap-6">
            {path.steps.map((step, i) => (
              <div 
                key={step.id} 
                className={`group relative flex flex-col gap-6 rounded-[2.5rem] border border-ink/8 p-8 transition-all hover:border-moss/30 hover:shadow-soft md:flex-row md:items-center ${
                  step.is_completed ? "bg-moss/5 border-moss/15" : "bg-white"
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink text-lg font-serif text-white group-hover:bg-moss transition-colors">
                  {step.is_completed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z" clipRule="evenodd" />
                    </svg>
                  ) : step.step_order}
                </div>
                
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-semibold leading-tight group-hover:text-ink transition-colors">
                    {step.title}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase tracking-widest text-ink/40">Step {step.step_order}</span>
                    {step.is_completed && <span className="text-[10px] font-bold uppercase tracking-widest text-moss">Completed</span>}
                  </div>
                </div>

                <Button 
                  href={`/courses/youtube/${step.playlist_id}`} 
                  variant={step.is_completed ? "secondary" : "ink"}
                  className="rounded-full px-8"
                >
                  {step.is_completed ? "Review Step" : "Begin step"}
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
