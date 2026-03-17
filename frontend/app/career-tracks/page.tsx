"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert } from "@/components/common/Alert";
import { publicApiFetch } from "@/lib/apiClient";

interface CareerTrack {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  estimated_duration: string | null;
}

const TRACK_GRADIENTS: Record<number, string> = {
  1: "from-[#f0f4ff] to-white",
  2: "from-[#f0fff4] to-white",
  3: "from-[#fff7ed] to-white",
  4: "from-[#fdf4ff] to-white",
  5: "from-[#f0fffe] to-white",
  6: "from-[#fffbf0] to-white",
};

const TRACK_ICONS: Record<number, string> = {
  1: "🎨",
  2: "⚙️",
  3: "📊",
  4: "🤖",
  5: "🔧",
  6: "🌐",
};

export default function CareerTracksPage() {
  const [tracks, setTracks] = useState<CareerTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await publicApiFetch<{ items: CareerTrack[] }>("/career-tracks");
        if (!cancelled) setTracks(res.items);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load career tracks.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-10">
      <section className="rounded-[2.75rem] border border-ink/10 bg-white/86 p-8 shadow-soft lg:p-10">
        <p className="text-xs uppercase tracking-[0.45em] text-ink/45">Job-Ready Programs</p>
        <h1 className="mt-4 font-serif text-5xl leading-[0.95] md:text-6xl">
          Career Tracks.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">
          Structured programs built around real job roles. Follow a clear roadmap of courses and projects to become job-ready in your chosen field.
        </p>
      </section>

      {error ? <Alert title="Career Tracks unavailable" tone="error">{error}</Alert> : null}

      {loading ? (
        <p className="text-sm text-ink/55">Loading career tracks...</p>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tracks.map((track) => (
            <Link
              key={track.id}
              href={`/career-tracks/${track.id}`}
              className={`group flex flex-col justify-between overflow-hidden rounded-[2rem] border border-ink/8 bg-gradient-to-br ${TRACK_GRADIENTS[track.id] ?? "from-white to-white"} p-6 transition-all hover:border-moss/40 hover:shadow-soft hover:-translate-y-1`}
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-4xl">{TRACK_ICONS[track.id] ?? "🎯"}</span>
                  <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-ink/60 shadow-sm border border-ink/5">
                    {track.estimated_duration ?? "Self-paced"}
                  </span>
                </div>
                <h3 className="text-xl font-semibold leading-tight text-ink group-hover:text-moss transition-colors">
                  {track.title}
                </h3>
                <p className="mt-1 text-xs font-medium text-ink/50 uppercase tracking-widest">
                  {track.difficulty}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">
                  {track.description}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-moss">
                Start Track
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-1">
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
