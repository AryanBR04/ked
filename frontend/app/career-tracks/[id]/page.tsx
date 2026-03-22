"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { publicApiFetch, apiFetchMaybeAuth } from "@/lib/apiClient";
import { Button } from "@/components/common/Button";
import Link from "next/link";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface Step {
  id: number;
  step_order: number;
  title: string;
  playlist_id: string | null;
  learning_path_id: number | null;
  is_completed: boolean;
}

interface CareerTrack {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  estimated_duration: string | null;
  steps: Step[];
  progress_percentage: number;
}

export default function CareerTrackDetailsPage() {
  const { id } = useParams();
  const [track, setTrack] = useState<CareerTrack | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await apiFetchMaybeAuth<CareerTrack>(`/career-tracks/${id}`);
        setTrack(data);
      } catch (err) {
        console.error("Failed to fetch career track:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="p-20 text-center">Loading career roadmap...</div>;
  if (!track) return <div className="p-20 text-center text-rose-500">Career track not found.</div>;

  return (
    <main className="container mx-auto max-w-5xl px-4 py-12 md:px-6">
      <div className="space-y-12">
        <header className="space-y-8">
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-ink/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/60 border border-ink/5">
              {track.difficulty} Track
            </span>
            {track.estimated_duration && (
              <span className="flex items-center gap-2 rounded-full bg-moss/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-moss border border-moss/10">
                <Clock size={12} /> {track.estimated_duration}
              </span>
            )}
          </div>
          
          <div className="max-w-4xl space-y-6">
            <h1 className="font-serif text-5xl leading-[0.9] text-ink md:text-7xl lg:text-8xl">
              {track.title}
            </h1>
            <p className="text-xl leading-relaxed text-ink/70 lg:text-2xl">
              {track.description}
            </p>
          </div>

          <div className="flex items-center gap-4">
             <div className="h-1.5 flex-1 max-w-sm rounded-full bg-ink/5 overflow-hidden">
                <div 
                  className="h-full bg-moss transition-all duration-1000" 
                  style={{ width: `${track.progress_percentage}%` }}
                />
             </div>
             <span className="text-sm font-bold text-moss">{track.progress_percentage}% COMPLETE</span>
          </div>
        </header>

        <section className="space-y-8">
          <div className="grid gap-4">
            {track.steps.map((step, i) => (
              <div 
                key={step.id}
                className={`group flex flex-col gap-6 rounded-[2.5rem] border p-8 transition-all hover:shadow-soft md:flex-row md:items-center ${
                  step.is_completed 
                    ? "bg-[#f6faf7] border-moss/20" 
                    : "bg-white border-ink/10"
                }`}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink text-white group-hover:bg-moss transition-colors">
                  {step.is_completed ? <CheckCircle2 size={24} /> : <span className="font-serif text-xl">{i + 1}</span>}
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-ink group-hover:text-black transition-colors">{step.title}</h3>
                  <p className="mt-1 text-sm text-ink/45 font-medium uppercase tracking-widest">
                    {step.learning_path_id ? "🎓 Learning Path" : "📺 Course Module"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    href={step.learning_path_id ? `/learning-paths/${step.learning_path_id}` : `/courses/youtube/${step.playlist_id}`}
                    variant={step.is_completed ? "secondary" : "ink"}
                    className="rounded-full px-10 py-6 text-base"
                  >
                    {step.is_completed ? "Review" : "Start Now"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
