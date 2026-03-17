"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert } from "@/components/common/Alert";
import { apiFetchMaybeAuth } from "@/lib/apiClient";

interface LearningPathStep {
  id: number;
  step_order: number;
  title: string;
  playlist_id: string;
  is_completed: boolean;
}

interface LearningPathDetail {
  id: number;
  title: string;
  description: string;
  technology: string;
  difficulty: string;
  steps: LearningPathStep[];
  progress_percentage: number;
}

export default function LearningPathDetailPage({ params }: { params: { id: string } }) {
  const [path, setPath] = useState<LearningPathDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPathDetails() {
      try {
        const response = await apiFetchMaybeAuth<LearningPathDetail>(`/learning-paths/${params.id}`);
        if (!cancelled) setPath(response);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load learning path details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPathDetails();

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (error) {
    return (
      <div className="space-y-10">
        <Alert title="Learning Path unavailable" tone="error">{error}</Alert>
      </div>
    );
  }

  if (loading || !path) {
    return <p className="text-sm text-ink/55 px-4">Loading path details...</p>;
  }

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[2.75rem] border border-ink/10 bg-[linear-gradient(180deg,#f5efe3_0%,#ffffff_100%)] p-8 shadow-soft lg:p-12">
        <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between items-start">
          <div className="max-w-3xl">
            <Link 
              href="/learning-paths"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-ink transition-colors mb-6"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              All Learning Paths
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <span className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.1em] text-ink/70 shadow-sm border border-ink/5">
                {path.technology}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.1em] text-ink/70 shadow-sm border border-ink/5">
                {path.difficulty}
              </span>
            </div>
            <h1 className="font-serif text-4xl leading-[1.1] md:text-5xl lg:text-6xl text-ink">
              {path.title}
            </h1>
            <p className="mt-6 text-lg xl:text-xl leading-relaxed text-ink/75 max-w-2xl">
              {path.description}
            </p>
          </div>
          
          <div className="w-full md:w-auto min-w-[240px] rounded-[2rem] bg-white border border-ink/8 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/50 mb-4 text-center">Your Progress</p>
            <div className="flex justify-center items-center mb-4">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#f6faf7]">
                <svg className="absolute h-full w-full rotate-[-90deg]">
                  <circle
                    cx="48"
                    cy="48"
                    r="44"
                    fill="none"
                    stroke="#e8f0e9"
                    strokeWidth="8"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="44"
                    fill="none"
                    stroke="#0b6339"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - path.progress_percentage / 100)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="text-2xl font-semibold text-moss">{path.progress_percentage}%</span>
              </div>
            </div>
            <p className="text-center text-sm text-ink/60">
              {path.steps.filter(s => s.is_completed).length} of {path.steps.length} steps complete
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-ink">Path Outline</h2>
          <span className="text-sm font-medium text-ink/50 bg-ink/5 px-3 py-1 rounded-full">
            {path.steps.length} Steps
          </span>
        </div>
        
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[1.375rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-ink/10 before:to-transparent">
          {path.steps.map((step, index) => (
            <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_2px_rgba(0,0,0,0.08)] z-10 transition-colors">
                {step.is_completed ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-moss" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-ink/20" />
                )}
              </div>
              
              <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-[1.5rem] border border-ink/8 bg-white shadow-sm transition-all hover:shadow-md hover:border-moss/30 group-hover:-translate-y-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs uppercase tracking-widest text-ink/40 font-medium">Step {step.step_order}</span>
                  {step.is_completed ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-moss bg-moss/10 px-2 py-0.5 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      Completed
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-ink/40 bg-ink/5 px-2 py-0.5 rounded-full pb-[3px]">
                      Not Started
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-ink leading-tight mb-4">
                  {step.title}
                </h3>
                
                <Link 
                  href={`/course/youtube/${step.playlist_id}`}
                  className={`inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    step.is_completed 
                      ? "bg-white border border-moss text-moss hover:bg-moss/5" 
                      : "bg-moss text-white hover:bg-moss/90"
                  }`}
                >
                  {step.is_completed ? "Review Course" : "Start Course"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
