"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/Auth/AuthGuard";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/common/Skeleton";
import { Button } from "@/components/common/Button";
import { Alert } from "@/components/common/Alert";
import { YoutubeLessonPlayer, YoutubeLessonPlayerHandle } from "@/components/Youtube/YoutubeLessonPlayer";
import CourseOverview from "@/components/Youtube/CourseOverview";
import CourseNotes from "@/components/Youtube/CourseNotes";
import { SuggestedProjects } from "@/components/Projects/SuggestedProjects";
import { apiFetchWithAuth } from "@/lib/apiClient";
import type { YoutubeCourseProgressSummary, YoutubePlaylistDetail } from "@/lib/types";

export default function YoutubePlaylistPage({
  params
}: {
  params: { playlistId: string };
}) {
  return (
    <AuthGuard>
      <YoutubePlaylistContent playlistId={params.playlistId} />
    </AuthGuard>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCompact(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function progressWidth(percent: number) {
  return `${Math.min(Math.max(percent, 0), 100)}%`;
}

function buildYoutubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function findPlayableLessonIndex(playlist: YoutubePlaylistDetail, preferredIndex: number) {
  const boundedIndex = Math.min(Math.max(preferredIndex, 0), Math.max(playlist.lessons.length - 1, 0));
  const preferredLesson = playlist.lessons[boundedIndex];
  if (preferredLesson?.is_embeddable !== false) return boundedIndex;
  const forwardIndex = playlist.lessons.findIndex(
    (lesson, index) => index >= boundedIndex && lesson.is_embeddable !== false
  );
  if (forwardIndex >= 0) return forwardIndex;
  return playlist.lessons.findIndex((lesson) => lesson.is_embeddable !== false);
}

function getAdjacentPlayableIndex(
  playlist: YoutubePlaylistDetail,
  fromIndex: number,
  direction: "next" | "previous"
) {
  const indexes =
    direction === "next"
      ? Array.from({ length: playlist.lessons.length - fromIndex - 1 }, (_, offset) => fromIndex + offset + 1)
      : Array.from({ length: fromIndex }, (_, offset) => fromIndex - offset - 1);
  return indexes.find((index) => playlist.lessons[index]?.is_embeddable !== false) ?? null;
}

/** Split lessons into modules of ~20 for large playlists, 1 module for small ones. */
function buildModules(lessons: YoutubePlaylistDetail["lessons"]) {
  const MODULE_SIZE = 20;
  if (lessons.length <= MODULE_SIZE) {
    return [{ label: "All Lessons", start: 0, end: lessons.length - 1, lessons }];
  }
  const modules = [];
  let i = 0;
  let moduleNum = 1;
  const moduleLabels: Record<number, string> = {
    1: "Getting Started",
    2: "Core Concepts",
    3: "Intermediate Topics",
    4: "Advanced Techniques",
    5: "Projects & Practice",
    6: "Expert Level",
    7: "Mastery",
    8: "Final Review"
  };
  while (i < lessons.length) {
    const chunk = lessons.slice(i, i + MODULE_SIZE);
    modules.push({
      label: moduleLabels[moduleNum] ?? `Module ${moduleNum}`,
      start: i,
      end: i + chunk.length - 1,
      lessons: chunk
    });
    i += MODULE_SIZE;
    moduleNum++;
  }
  return modules;
}

// ─── Main component ─────────────────────────────────────────────────────────

function YoutubePlaylistContent({ playlistId }: { playlistId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [playlist, setPlaylist] = useState<YoutubePlaylistDetail | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [collapsedModules, setCollapsedModules] = useState<Set<number>>(new Set());

  // Refs for sidebar scroll-to-active
  const playerRef = useRef<YoutubeLessonPlayerHandle>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const lessonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // ── Load playlist ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function loadPlaylist() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFetchWithAuth<YoutubePlaylistDetail>(`/youtube/playlists/${playlistId}`);
        if (!cancelled) {
          setPlaylist(response);
          // Use ?lesson= URL param if present, else resume index
          const urlLesson = searchParams.get("lesson");
          const preferredIndex = urlLesson
            ? Math.max(0, parseInt(urlLesson, 10) - 1)
            : response.resume_video_index;
          const playableIndex = findPlayableLessonIndex(response, preferredIndex);
          setSelectedIndex(playableIndex >= 0 ? playableIndex : 0);
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Failed to load playlist.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadPlaylist();
    return () => { cancelled = true; };
  }, [playlistId]); // intentionally exclude searchParams to avoid re-load on URL update

  // ── Sync URL ?lesson= when selectedIndex changes ───────────────────────────
  useEffect(() => {
    if (!playlist) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("lesson", String(selectedIndex + 1));
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [selectedIndex, playlist]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Scroll sidebar to active lesson ────────────────────────────────────────
  useEffect(() => {
    const el = lessonRefs.current.get(selectedIndex);
    if (el && sidebarRef.current) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex]);

  // ── Derived state ──────────────────────────────────────────────────────────
  const selectedLesson = useMemo(() => playlist?.lessons[selectedIndex] ?? null, [playlist, selectedIndex]);
  const completedIndexes = useMemo(() => new Set(playlist?.progress.completed_video_indexes ?? []), [playlist]);
  const nextPlayableIndex = useMemo(
    () => (playlist ? getAdjacentPlayableIndex(playlist, selectedIndex, "next") : null),
    [playlist, selectedIndex]
  );
  const previousPlayableIndex = useMemo(
    () => (playlist ? getAdjacentPlayableIndex(playlist, selectedIndex, "previous") : null),
    [playlist, selectedIndex]
  );
  const modules = useMemo(() => (playlist ? buildModules(playlist.lessons) : []), [playlist]);

  // ── Navigate to lesson ─────────────────────────────────────────────────────
  const navigateTo = useCallback((index: number) => {
    setSelectedIndex(index);
    setPlayerError(null);
    void saveProgress(index);
    // Expand the module that contains this lesson
    if (playlist) {
      const mods = buildModules(playlist.lessons);
      const modIdx = mods.findIndex(m => index >= m.start && index <= m.end);
      if (modIdx >= 0) {
        setCollapsedModules(prev => {
          const next = new Set(prev);
          next.delete(modIdx);
          return next;
        });
      }
    }
  }, [playlist]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save progress ──────────────────────────────────────────────────────────
  async function saveProgress(nextIndex: number, completedIndex?: number) {
    if (!playlist) return null;
    setSaving(true);
    try {
      const progress = await apiFetchWithAuth<YoutubeCourseProgressSummary>(
        `/youtube/playlists/${playlist.playlist_id}/progress`,
        {
          method: "POST",
          body: JSON.stringify({
            current_video_index: nextIndex,
            total_videos: playlist.lessons.length,
            ...(completedIndex !== undefined ? { completed_video_index: completedIndex } : {})
          })
        }
      );
      setPlaylist((current) => (current ? { ...current, progress } : current));
      return progress;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save playlist progress.");
      return null;
    } finally {
      setSaving(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5">
        <section className="rounded-[2.5rem] border border-ink/10 bg-white p-5 shadow-soft">
          <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
            <Skeleton className="h-36 w-full rounded-[1.5rem]" />
            <div className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-full" />
              </div>
              <Skeleton className="h-8 w-3/4 rounded-lg" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-32 rounded-full" />
              </div>
              <Skeleton className="h-10 w-full rounded-2xl" />
            </div>
          </div>
        </section>
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <Skeleton className="aspect-video w-full rounded-[2rem]" />
            <div className="rounded-[2rem] border border-ink/10 bg-white p-5 shadow-soft space-y-4">
              <Skeleton className="h-8 w-1/2 rounded-lg" />
              <Skeleton className="h-4 w-1/4 rounded-lg" />
            </div>
          </div>
          <aside className="rounded-[2rem] border border-ink/10 bg-white p-4 shadow-soft space-y-3">
            <Skeleton className="h-6 w-1/2 rounded-lg" />
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </aside>
        </section>
      </div>
    );
  }

  if (!playlist || !selectedLesson) {
    return (
      <ErrorState 
        message={error ?? "This YouTube playlist could not be loaded."} 
        onRetry={() => window.location.reload()} 
      />
    );
  }

  const isMultiModule = modules.length > 1;

  return (
    <div className="space-y-5">
      {error ? <Alert title="YouTube course notice" tone="error">{error}</Alert> : null}
      {playerError ? <Alert title="Player unavailable" tone="error">{playerError}</Alert> : null}

      {/* ── Course header ── */}
      <section className="rounded-[2.5rem] border border-ink/10 bg-white p-5 shadow-soft">
        <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
          {/* Thumbnail */}
          <div className="relative h-36 overflow-hidden rounded-[1.5rem] bg-ink/5">
            {playlist.thumbnail ? (
              <Image
                src={playlist.thumbnail}
                alt={`${playlist.title} thumbnail`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 220px"
              />
            ) : null}
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-ink/48">
              <span>{playlist.technology ?? "YouTube course"}</span>
              <span className="h-1 w-1 rounded-full bg-ink/25" />
              <span>{playlist.channel_name}</span>
            </div>
            <h1 className="text-2xl font-semibold leading-tight md:text-3xl">{playlist.title}</h1>
            {/* Metadata chips */}
            <div className="flex flex-wrap gap-2 text-xs text-ink/65">
              <span className="rounded-full bg-ink/5 px-3 py-1.5 font-bold text-ink/80">
                📚 {playlist.video_count} Lessons
              </span>
              <span className="rounded-full bg-ink/5 px-3 py-1.5">
                ⏱ {Math.round((playlist.duration_seconds || (playlist.video_count * 15 * 60)) / 3600)}h {Math.round(((playlist.duration_seconds || (playlist.video_count * 15 * 60)) % 3600) / 60)}m duration
              </span>
              <span className="rounded-full bg-ink/5 px-3 py-1.5 text-moss font-semibold">
                🎯 {playlist.difficulty || "Beginner"}
              </span>
              {playlist.published_date && (
                <span className="rounded-full bg-ink/5 px-3 py-1.5">
                  📅 Published {new Date(playlist.published_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                </span>
              )}
            </div>
            {/* Progress bar */}
            <div className="rounded-[1.4rem] border border-moss/10 bg-[#f6faf7] px-4 py-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold">
                  Course Progress
                </span>
                <span className="text-moss font-semibold">{playlist.progress.percent_complete}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-moss/10">
                <div
                  className="h-full rounded-full bg-moss transition-all duration-500"
                  style={{ width: progressWidth(playlist.progress.percent_complete) }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* ── AI Course Overview ── */}
      <CourseOverview course={playlist} />

      {/* ── Player + Sidebar ── */}
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">

        {/* Player column */}
        <div className="space-y-4 lg:order-1">
          {selectedLesson.is_embeddable === false ? (
            <div className="rounded-[2rem] border border-ink/10 bg-white p-8 shadow-soft">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/45">Playback unavailable here</p>
              <h3 className="mt-3 text-2xl font-semibold">This lesson cannot be embedded.</h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/65">
                Some YouTube videos disable iframe playback. Open this lesson directly on YouTube, then continue with the next lesson.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button href={buildYoutubeWatchUrl(selectedLesson.video_id)}>Watch on YouTube</Button>
                {nextPlayableIndex !== null ? (
                  <Button variant="secondary" onClick={() => navigateTo(nextPlayableIndex)}>
                    Skip to next lesson
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <YoutubeLessonPlayer
              ref={playerRef}
              videoId={selectedLesson.video_id}
              onCompleted={() => {
                const resumeIndex = nextPlayableIndex ?? selectedIndex;
                void (async () => {
                  const progress = await saveProgress(resumeIndex, selectedIndex);
                  if (progress && nextPlayableIndex !== null) {
                    setSelectedIndex(nextPlayableIndex);
                    setPlayerError(null);
                  }
                })();
              }}
              onError={() => setPlayerError("This YouTube video could not be loaded in the embedded player.")}
            />
          )}

          {playlist.progress.percent_complete === 100 && (
            <SuggestedProjects technology={playlist.technology || "General"} />
          )}

          {/* Current lesson info + prev/next */}
          <div className="rounded-[2rem] border border-ink/10 bg-white p-5 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.22em] text-ink/45">
                  Lesson {selectedIndex + 1} of {playlist.lessons.length}
                  {completedIndexes.has(selectedIndex) ? (
                    <span className="ml-2 inline-flex items-center gap-1 font-semibold text-moss">
                      ✔ Completed
                    </span>
                  ) : null}
                </p>
                <h3 className="mt-1 text-xl font-semibold leading-tight">{selectedLesson.title}</h3>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  variant="secondary"
                  disabled={previousPlayableIndex === null || saving}
                  onClick={() => previousPlayableIndex !== null && navigateTo(previousPlayableIndex)}
                >
                  ← Previous
                </Button>
                <Button
                  disabled={nextPlayableIndex === null || saving}
                  onClick={() => nextPlayableIndex !== null && navigateTo(nextPlayableIndex)}
                >
                  {nextPlayableIndex === null ? "Last lesson" : "Next →"}
                </Button>
              </div>
            </div>
            <p className="mt-3 text-xs text-ink/50">
              Progress saves automatically after watching 90% of a lesson.
            </p>
          </div>

          {/* Course Notes */}
          <CourseNotes 
            playlistId={playlist.playlist_id} 
            videoIndex={selectedIndex} 
            playerRef={playerRef} 
          />
        </div>

        {/* Sidebar */}
        <aside className="rounded-[2rem] border border-ink/10 bg-white shadow-soft lg:order-2 flex flex-col max-h-[80vh] overflow-hidden">
          {/* Sidebar header */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-ink/8 p-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-ink/40">Course Outline</p>
              <h2 className="mt-0.5 text-base font-semibold">Lessons</h2>
            </div>
            <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-xs text-ink/55">
              {playlist.progress.completed_videos}/{playlist.lessons.length}
            </span>
          </div>

          {/* Scrollable lesson list */}
          <div ref={sidebarRef} className="flex-1 overflow-y-auto p-3 space-y-1">
            {modules.map((mod, modIdx) => {
              const isCollapsed = isMultiModule && collapsedModules.has(modIdx);
              const modCompleted = mod.lessons.filter((_, i) => completedIndexes.has(mod.start + i)).length;

              return (
                <div key={modIdx}>
                  {/* Module header (only for multi-module playlists) */}
                  {isMultiModule ? (
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-ink/5 transition-colors mb-1"
                      onClick={() => setCollapsedModules(prev => {
                        const next = new Set(prev);
                        if (next.has(modIdx)) next.delete(modIdx);
                        else next.add(modIdx);
                        return next;
                      })}
                    >
                      <div>
                        <p className="text-xs font-semibold text-ink uppercase tracking-wide">
                          {mod.label}
                        </p>
                        <p className="text-[10px] text-ink/45">Lessons {mod.start + 1}–{mod.end + 1} · {modCompleted}/{mod.lessons.length} done</p>
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14" height="14" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth="2"
                        className={`shrink-0 text-ink/35 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  ) : null}

                  {!isCollapsed && (
                    <div className="space-y-0.5">
                      {mod.lessons.map((lesson, lessonOffset) => {
                        const absoluteIndex = mod.start + lessonOffset;
                        const isSelected = absoluteIndex === selectedIndex;
                        const isCompleted = completedIndexes.has(absoluteIndex);

                        return (
                          <button
                            key={lesson.video_id}
                            type="button"
                            ref={(el) => {
                              if (el) lessonRefs.current.set(absoluteIndex, el);
                              else lessonRefs.current.delete(absoluteIndex);
                            }}
                            className={[
                              "w-full rounded-[1rem] border px-3 py-2.5 text-left transition-all",
                              isSelected
                                ? "border-moss/30 bg-[#eef4ef]"
                                : "border-transparent hover:border-ink/10 hover:bg-ink/4"
                            ].join(" ")}
                            onClick={() => navigateTo(absoluteIndex)}
                          >
                            <div className="flex items-start gap-2.5">
                              {/* Bubble: lesson number or checkmark */}
                              <span className={[
                                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                                isCompleted
                                  ? "bg-moss text-white"
                                  : isSelected
                                  ? "bg-moss/15 text-moss"
                                  : "bg-ink/8 text-ink/55"
                              ].join(" ")}>
                                {isCompleted ? "✓" : String(absoluteIndex + 1).padStart(2, "0")}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className={`text-xs font-semibold leading-snug ${isSelected ? "text-moss" : "text-ink"}`}>
                                  {lesson.title}
                                </p>
                                <p className="mt-0.5 text-[10px] text-ink/45">
                                  {lesson.is_embeddable === false
                                    ? "⚠ Open on YouTube"
                                    : isCompleted
                                    ? "✔ Completed"
                                    : isSelected
                                    ? "▶ Playing"
                                    : "Ready"}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </section>
    </div>
  );
}
