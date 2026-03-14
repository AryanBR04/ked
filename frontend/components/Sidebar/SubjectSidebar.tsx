"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetchWithAuth } from "@/lib/apiClient";
import type { SubjectProgress, SubjectTreeResponse } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";
import { useSidebarStore } from "@/store/sidebarStore";
import { VideoProgressBar } from "@/components/Video/VideoProgressBar";

function formatDuration(seconds: number | null) {
  if (!seconds) {
    return "Video";
  }

  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} min`;
}

export function SubjectSidebar({
  subjectId,
  activeVideoId
}: {
  subjectId: number;
  activeVideoId?: number;
}) {
  const user = useAuthStore((state) => state.user);
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);
  const { tree, loading, error, setLoading, setError, setTree } = useSidebarStore();
  const [progress, setProgress] = useState<SubjectProgress | null>(null);

  useEffect(() => {
    if (!isBootstrapped || !user) {
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [treeResponse, progressResponse] = await Promise.all([
          apiFetchWithAuth<SubjectTreeResponse>(`/subjects/${subjectId}/tree`),
          apiFetchWithAuth<SubjectProgress>(`/progress/subjects/${subjectId}`)
        ]);

        if (!cancelled) {
          setTree(treeResponse);
          setProgress(progressResponse);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load lessons.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [isBootstrapped, setError, setLoading, setTree, subjectId, user]);

  if (!user) {
    return (
      <aside className="rounded-4xl border border-ink/10 bg-white p-5 shadow-soft">
        <p className="text-sm font-semibold">Lesson map</p>
        <p className="mt-2 text-sm text-ink/65">
          Sign in to see progress, locks, and the full lesson flow.
        </p>
      </aside>
    );
  }

  return (
    <aside className="rounded-4xl border border-ink/10 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink/45">Learning path</p>
          <h2 className="mt-2 text-lg font-semibold">{tree?.title ?? "Course structure"}</h2>
        </div>
        {progress ? (
          <div className="min-w-20 text-right text-sm">
            <div className="font-semibold">{progress.percent_complete}%</div>
            <div className="text-ink/45">done</div>
          </div>
        ) : null}
      </div>
      {progress ? <VideoProgressBar value={progress.percent_complete} className="mt-4" /> : null}
      {loading ? <p className="mt-5 text-sm text-ink/55">Loading lessons...</p> : null}
      {error ? <p className="mt-5 text-sm text-clay">{error}</p> : null}
      <div className="mt-6 space-y-5">
        {tree?.sections.map((section) => (
          <div key={section.id}>
            <p className="text-xs uppercase tracking-[0.25em] text-ink/45">{section.title}</p>
            <div className="mt-3 space-y-2">
              {section.videos.map((video) => {
                const isActive = video.id === activeVideoId;
                const statusLabel = video.locked ? "Locked" : video.is_completed ? "Done" : "Open";

                return (
                  <Link
                    key={video.id}
                    href={`/subjects/${subjectId}/video/${video.id}`}
                    className={[
                      "block rounded-3xl border px-4 py-3 transition",
                      isActive ? "border-ink bg-ink text-fog" : "border-ink/10 bg-fog hover:border-ink/30",
                      video.locked ? "pointer-events-none opacity-60" : ""
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{video.title}</p>
                        <p className={`mt-1 text-xs ${isActive ? "text-fog/70" : "text-ink/55"}`}>
                          {formatDuration(video.duration_seconds)}
                        </p>
                      </div>
                      <span
                        className={[
                          "rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.22em]",
                          isActive
                            ? "bg-fog/10 text-fog"
                            : video.is_completed
                              ? "bg-moss/10 text-moss"
                              : video.locked
                                ? "bg-ink/10 text-ink/55"
                                : "bg-sand text-ink"
                        ].join(" ")}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
