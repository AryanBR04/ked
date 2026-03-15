"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/Auth/AuthGuard";
import { Alert } from "@/components/common/Alert";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { YoutubeLessonPlayer } from "@/components/Youtube/YoutubeLessonPlayer";
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

  if (preferredLesson?.is_embeddable !== false) {
    return boundedIndex;
  }

  const forwardIndex = playlist.lessons.findIndex(
    (lesson, index) => index >= boundedIndex && lesson.is_embeddable !== false
  );

  if (forwardIndex >= 0) {
    return forwardIndex;
  }

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

function YoutubePlaylistContent({ playlistId }: { playlistId: string }) {
  const [playlist, setPlaylist] = useState<YoutubePlaylistDetail | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPlaylist() {
      setLoading(true);
      setError(null);

      try {
        const response = await apiFetchWithAuth<YoutubePlaylistDetail>(`/youtube/playlists/${playlistId}`);

        if (!cancelled) {
          setPlaylist(response);
          const playableIndex = findPlayableLessonIndex(response, response.resume_video_index);
          setSelectedIndex(playableIndex >= 0 ? playableIndex : 0);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load playlist.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPlaylist();

    return () => {
      cancelled = true;
    };
  }, [playlistId]);

  const selectedLesson = useMemo(
    () => playlist?.lessons[selectedIndex] ?? null,
    [playlist, selectedIndex]
  );
  const completedIndexes = useMemo(
    () => new Set(playlist?.progress.completed_video_indexes ?? []),
    [playlist]
  );
  const nextPlayableIndex = useMemo(
    () => (playlist ? getAdjacentPlayableIndex(playlist, selectedIndex, "next") : null),
    [playlist, selectedIndex]
  );
  const previousPlayableIndex = useMemo(
    () => (playlist ? getAdjacentPlayableIndex(playlist, selectedIndex, "previous") : null),
    [playlist, selectedIndex]
  );

  async function saveProgress(nextIndex: number, completedIndex?: number) {
    if (!playlist) {
      return null;
    }

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

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!playlist || !selectedLesson) {
    return <Alert title="Playlist unavailable" tone="error">{error ?? "This YouTube playlist could not be loaded."}</Alert>;
  }

  return (
    <div className="space-y-6">
      {error ? <Alert title="YouTube course notice" tone="error">{error}</Alert> : null}
      {playerError ? <Alert title="Player unavailable" tone="error">{playerError}</Alert> : null}

      <section className="rounded-[2.5rem] border border-ink/10 bg-white p-6 shadow-soft">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="relative h-48 overflow-hidden rounded-[1.8rem] bg-ink/5">
            {playlist.thumbnail ? (
              <Image
                src={playlist.thumbnail}
                alt={`${playlist.title} thumbnail`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 280px"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-ink/48">
              <span>{playlist.technology ?? "YouTube course"}</span>
              <span className="h-1 w-1 rounded-full bg-ink/25" />
              <span>{playlist.channel_name}</span>
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight">{playlist.title}</h1>
            <div className="flex flex-wrap gap-2 text-sm text-ink/62">
              <span className="rounded-full bg-ink/5 px-3 py-1.5">{playlist.video_count} videos</span>
              <span className="rounded-full bg-ink/5 px-3 py-1.5">{formatCompact(playlist.views)} views</span>
              <span className="rounded-full bg-ink/5 px-3 py-1.5">{formatCompact(playlist.likes)} likes</span>
            </div>
            <div className="rounded-[1.6rem] border border-moss/10 bg-[#f6faf7] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">
                    {playlist.progress.completed_videos} / {playlist.progress.total_videos} lessons completed
                  </p>
                  <p className="mt-1 text-sm text-ink/62">
                    Resume opens lesson {Math.min(playlist.progress.current_video_index + 1, playlist.lessons.length)}.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const playableIndex = findPlayableLessonIndex(
                      playlist,
                      Math.min(playlist.progress.current_video_index, playlist.lessons.length - 1)
                    );
                    setSelectedIndex(playableIndex >= 0 ? playableIndex : 0);
                    setPlayerError(null);
                  }}
                >
                  Resume
                </Button>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-moss/10">
                <div
                  className="h-full rounded-full bg-moss"
                  style={{ width: progressWidth(playlist.progress.percent_complete) }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-ink/10 bg-white p-4 shadow-soft">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-ink/45">Lessons</p>
              <h2 className="mt-2 text-2xl font-semibold">Playlist outline</h2>
            </div>
            <span className="rounded-full bg-ink/5 px-3 py-1 text-xs text-ink/58">{playlist.lessons.length}</span>
          </div>
          <div className="space-y-2">
            {playlist.lessons.map((lesson, index) => {
              const isSelected = index === selectedIndex;
              const isCompleted = completedIndexes.has(index);

              return (
                <button
                  key={lesson.video_id}
                  type="button"
                  className={[
                    "w-full rounded-[1.3rem] border p-3 text-left transition",
                    isSelected
                      ? "border-moss/25 bg-[#eef4ef]"
                      : "border-ink/8 bg-white hover:border-ink/15 hover:bg-ink/5"
                  ].join(" ")}
                  onClick={() => {
                    setSelectedIndex(index);
                    setPlayerError(null);
                    void saveProgress(index);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={[
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        isCompleted ? "bg-moss text-fog" : "bg-ink/8 text-ink/68"
                      ].join(" ")}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-sm font-semibold leading-6">{lesson.title}</p>
                      <p className="mt-1 text-xs text-ink/55">
                        {lesson.is_embeddable === false
                          ? "Open on YouTube"
                          : isCompleted
                            ? "Completed"
                            : isSelected
                              ? "Currently playing"
                              : "Ready to play"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="space-y-5">
          {selectedLesson.is_embeddable === false ? (
            <div className="rounded-[2rem] border border-ink/10 bg-white p-8 shadow-soft">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/45">Playback unavailable here</p>
              <h3 className="mt-3 text-3xl font-semibold">This lesson cannot be embedded inside the app.</h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/65">
                Some YouTube videos disable iframe playback. You can still open this lesson directly on YouTube, then
                jump back here and continue with the next playable lesson.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href={buildYoutubeWatchUrl(selectedLesson.video_id)}>Watch on YouTube</Button>
                {nextPlayableIndex !== null ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedIndex(nextPlayableIndex);
                      setPlayerError(null);
                      void saveProgress(nextPlayableIndex);
                    }}
                  >
                    Go to next playable lesson
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <YoutubeLessonPlayer
              videoId={selectedLesson.video_id}
              onCompleted={() => {
                const nextIndex = nextPlayableIndex ?? selectedIndex;
                const resumeIndex = nextPlayableIndex ?? selectedIndex;

                void (async () => {
                  const progress = await saveProgress(resumeIndex, selectedIndex);

                  if (progress && nextPlayableIndex !== null) {
                    setSelectedIndex(nextPlayableIndex);
                    setPlayerError(null);
                  }
                })();
              }}
              onError={() => {
                setPlayerError("This YouTube video could not be loaded in the embedded player.");
              }}
            />
          )}

          <div className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-ink/45">
                  Lesson {selectedIndex + 1} of {playlist.lessons.length}
                </p>
                <h3 className="mt-2 text-3xl font-semibold">{selectedLesson.title}</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  disabled={previousPlayableIndex === null || saving}
                  onClick={() => {
                    if (previousPlayableIndex === null) {
                      return;
                    }

                    setSelectedIndex(previousPlayableIndex);
                    setPlayerError(null);
                    void saveProgress(previousPlayableIndex);
                  }}
                >
                  Previous
                </Button>
                <Button
                  disabled={nextPlayableIndex === null || saving}
                  onClick={() => {
                    if (nextPlayableIndex === null) {
                      return;
                    }

                    setSelectedIndex(nextPlayableIndex);
                    setPlayerError(null);
                    void saveProgress(nextPlayableIndex);
                  }}
                >
                  {nextPlayableIndex === null ? "Last playable lesson" : "Next lesson"}
                </Button>
              </div>
            </div>
            <div className="mt-5 text-sm text-ink/62">
              When a lesson finishes, progress is saved automatically and the resume button points to the next lesson.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
