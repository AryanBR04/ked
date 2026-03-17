"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert } from "@/components/common/Alert";
import { publicApiFetch } from "@/lib/apiClient";

interface LearningPath {
  id: number;
  title: string;
  description: string;
  technology: string;
  difficulty: string;
}

export default function LearningPathsPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPaths() {
      try {
        const response = await publicApiFetch<{ items: LearningPath[] }>("/learning-paths");
        if (!cancelled) setPaths(response.items);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load learning paths.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPaths();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-10">
      <section className="rounded-[2.75rem] border border-ink/10 bg-white/86 p-8 shadow-soft lg:p-10">
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-ink/45">Structured Learning Journeys</p>
          <h1 className="mt-4 font-serif text-5xl leading-[0.95] md:text-6xl">
            Expert Curated <br /> Learning Paths.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">
            Follow carefully curated sequences of courses designed to take you step-by-step from beginner to mastery in a specific technology stack.
          </p>
        </div>
      </section>

      {error ? <Alert title="Learning Paths unavailable" tone="error">{error}</Alert> : null}
      
      {loading ? (
        <p className="text-sm text-ink/55 px-4">Loading learning paths...</p>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {paths.map((path) => (
            <Link 
              href={`/learning-path/${path.id}`} 
              key={path.id}
              className="group flex flex-col justify-between overflow-hidden rounded-[1.8rem] border border-ink/8 bg-white p-6 transition-all hover:border-moss/40 hover:shadow-soft"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-full bg-[#f5efe3] px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-ink/70">
                    {path.technology}
                  </span>
                  <span className="rounded-full bg-ink/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-ink/70">
                    {path.difficulty}
                  </span>
                </div>
                <h3 className="text-xl font-semibold leading-tight group-hover:text-moss transition-colors">
                  {path.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/68">
                  {path.description}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-moss">
                Start Journey
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="transition-transform group-hover:translate-x-1"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
