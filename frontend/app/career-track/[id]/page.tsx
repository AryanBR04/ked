"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert } from "@/components/common/Alert";
import { apiFetchMaybeAuth } from "@/lib/apiClient";

interface CareerTrackStep {
  id: number;
  step_order: number;
  title: string;
  playlist_id: string | null;
  learning_path_id: number | null;
  is_completed: boolean;
}

interface CareerTrackDetail {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  estimated_duration: string | null;
  steps: CareerTrackStep[];
  completed_steps: number;
  total_steps: number;
  progress_percentage: number;
}

export default function CareerTrackDetailPage({ params }: { params: { id: string } }) {
  const [track, setTrack] = useState<CareerTrackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await apiFetchMaybeAuth<CareerTrackDetail>(`/career-tracks/${params.id}`);
        if (!cancelled) setTrack(res);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load career track.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [params.id]);

  if (error) {
    return <Alert title="Career Track unavailable" tone="error">{error}</Alert>;
  }

  if (loading || !track) {
    return <p className="text-sm text-ink/55">Loading career track...</p>;
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[2.75rem] border border-ink/10 bg-[linear-gradient(160deg,#eef4ef_0%,#ffffff_60%)] p-8 shadow-soft lg:p-12">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_280px] items-start">
          <div>
            <Link
              href="/career-tracks"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink/55 hover:text-ink transition-colors mb-6"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              All Career Tracks
            </Link>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.1em] text-ink/65 shadow-sm border border-ink/5">
                {track.difficulty}
              </span>
              {track.estimated_duration && (
                <span className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.1em] text-ink/65 shadow-sm border border-ink/5">
                  ⏱ {track.estimated_duration}
                </span>
              )}
            </div>
            <h1 className="font-serif text-4xl leading-tight md:text-5xl lg:text-6xl">{track.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink/70">{track.description}</p>
          </div>

          {/* Progress card */}
          <div className="rounded-[2rem] bg-white border border-ink/8 p-6 shadow-sm min-w-[240px]">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/50 mb-4 text-center">Your Progress</p>
            <div className="flex justify-center mb-4">
              <div className="relative flex h-24 w-24 items-center justify-center">
                <svg className="absolute h-full w-full rotate-[-90deg] overflow-visible">
                  <circle cx="48" cy="48" r="44" fill="none" stroke="#e8f0e9" strokeWidth="8" />
                  <circle
                    cx="48" cy="48" r="44" fill="none" stroke="#0b6339" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - track.progress_percentage / 100)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="text-2xl font-semibold text-moss">{track.progress_percentage}%</span>
              </div>
            </div>
            <p className="text-center text-sm text-ink/60">
              {track.completed_steps} of {track.total_steps} steps complete
            </p>
            {track.progress_percentage === 100 && (
              <div className="mt-4 rounded-xl bg-moss/10 px-4 py-2 text-center text-sm font-semibold text-moss">
                🎉 Track Complete!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Progress bar */}
      <div className="rounded-[1.5rem] border border-ink/8 bg-white p-5 shadow-sm">
        <div className="flex justify-between items-center mb-3 text-sm">
          <span className="font-medium text-ink/70">Overall Progress</span>
          <span className="font-semibold text-moss">{track.completed_steps}/{track.total_steps} steps</span>
        </div>
        <div className="h-3 rounded-full bg-moss/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-moss transition-all duration-700 ease-out"
            style={{ width: `${track.progress_percentage}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <section>
        <h2 className="mb-6 text-2xl font-semibold">Track Roadmap</h2>
        <div className="space-y-3">
          {track.steps.map((step, index) => {
            const isPrevComplete = index === 0 || track.steps[index - 1]?.is_completed;
            const isLocked = !isPrevComplete && !step.is_completed;

            const href = step.playlist_id
              ? `/course/youtube/${step.playlist_id}`
              : step.learning_path_id
              ? `/learning-path/${step.learning_path_id}`
              : null;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 rounded-[1.5rem] border p-5 transition-all ${
                  step.is_completed
                    ? "border-moss/25 bg-[#f0faf2]"
                    : isLocked
                    ? "border-ink/6 bg-ink/2 opacity-60"
                    : "border-ink/8 bg-white hover:border-moss/30 hover:shadow-sm"
                }`}
              >
                {/* Step number / check */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  step.is_completed
                    ? "bg-moss text-white"
                    : isLocked
                    ? "bg-ink/8 text-ink/40"
                    : "bg-[#f5efe3] text-ink"
                }`}>
                  {step.is_completed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  ) : step.step_order}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`font-semibold leading-tight ${step.is_completed ? "text-moss" : "text-ink"}`}>
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs text-ink/45 uppercase tracking-widest">
                    {step.is_completed ? "Completed ✔" : isLocked ? "Complete previous step" : "Ready to start"}
                  </p>
                </div>

                {href && !isLocked ? (
                  <Link
                    href={href}
                    className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                      step.is_completed
                        ? "border border-moss text-moss hover:bg-moss/5"
                        : "bg-moss text-white hover:bg-moss/90"
                    }`}
                  >
                    {step.is_completed ? "Review" : "Start"}
                  </Link>
                ) : !href && !isLocked ? (
                  <span className="shrink-0 rounded-xl bg-ink/5 px-4 py-2 text-xs text-ink/40">
                    Coming soon
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
