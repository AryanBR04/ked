"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/Auth/AuthGuard";
import { Alert } from "@/components/common/Alert";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { VideoMeta } from "@/components/Video/VideoMeta";
import { VideoPlayer } from "@/components/Video/VideoPlayer";
import { apiFetchWithAuth } from "@/lib/apiClient";
import { createProgressReporter } from "@/lib/progress";
import type { VideoDetail, VideoProgress } from "@/lib/types";
import { useSidebarStore } from "@/store/sidebarStore";
import { useVideoStore } from "@/store/videoStore";

export default function VideoPage({
  params
}: {
  params: { subjectId: string; videoId: string };
}) {
  return (
    <AuthGuard>
      <VideoPageContent params={params} />
    </AuthGuard>
  );
}

function VideoPageContent({
  params
}: {
  params: { subjectId: string; videoId: string };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [progress, setProgress] = useState<VideoProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markVideoCompleted = useSidebarStore((state) => state.markVideoCompleted);
  const setCurrentTime = useVideoStore((state) => state.setCurrentTime);
  const setCurrentVideo = useVideoStore((state) => state.setCurrentVideo);
  const markCompleted = useVideoStore((state) => state.markCompleted);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [videoResponse, progressResponse] = await Promise.all([
          apiFetchWithAuth<VideoDetail>(`/videos/${params.videoId}`),
          apiFetchWithAuth<VideoProgress>(`/progress/videos/${params.videoId}`)
        ]);

        if (!cancelled) {
          setVideo(videoResponse);
          setProgress(progressResponse);
          setCurrentVideo({
            videoId: videoResponse.id,
            duration: videoResponse.duration_seconds ?? 0,
            isCompleted: videoResponse.is_completed,
            previousVideoId: videoResponse.previous_video_id,
            nextVideoId: videoResponse.next_video_id
          });
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load video.");
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
  }, [params.videoId, setCurrentVideo]);

  const progressReporter = useMemo(
    () =>
      createProgressReporter(async (currentSeconds, isCompleted) => {
        await apiFetchWithAuth(`/progress/videos/${params.videoId}`, {
          method: "POST",
          body: JSON.stringify({
            last_position_seconds: currentSeconds,
            is_completed: isCompleted
          })
        });
      }),
    [params.videoId]
  );

  async function handleComplete() {
    if (!video) {
      return;
    }

    await progressReporter.flush(true);
    markVideoCompleted(video.id);
    markCompleted();

    if (video.next_video_id) {
      startTransition(() => {
        router.push(`/subjects/${video.subject_id}/video/${video.next_video_id}`);
      });
      return;
    }

    setError("Course complete. You have finished the last available lesson.");
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!video) {
    return <Alert title="Video unavailable" tone="error">{error ?? "This lesson could not be loaded."}</Alert>;
  }

  return (
    <div className="space-y-6">
        {error ? (
          <Alert
            title={video.locked ? "Lesson locked" : error.includes("complete") ? "Nice work" : "Playback issue"}
            tone={video.locked ? "error" : error.includes("complete") ? "success" : "error"}
          >
            {video.locked ? video.unlock_reason ?? error : error}
          </Alert>
        ) : null}
        {video.locked ? (
          <div className="rounded-[2.5rem] border border-ink/10 bg-white p-8 shadow-soft">
            <p className="text-sm text-ink/70">{video.unlock_reason ?? "Complete the previous lesson first."}</p>
            <div className="mt-5">
              <Button href={`/subjects/${video.subject_id}`} variant="secondary">Back to course</Button>
            </div>
          </div>
        ) : (
          <>
            {video.youtube_embed_url ? (
              <VideoPlayer
                youtubeUrl={video.youtube_url}
                startPositionSeconds={progress?.last_position_seconds ?? 0}
                onProgress={(currentTime) => {
                  setCurrentTime(currentTime);
                  progressReporter.queue(currentTime);
                }}
                onCompleted={() => {
                  void handleComplete();
                }}
              />
            ) : (
              <Alert title="Video unavailable" tone="error">
                This YouTube URL could not be embedded. Replace it with a valid YouTube watch link or video ID.
              </Alert>
            )}
            <VideoMeta
              title={video.title}
              sectionTitle={video.section_title}
              description={video.description}
              previousVideoId={video.previous_video_id}
              nextVideoId={video.next_video_id}
              subjectId={video.subject_id}
            />
            <div className="rounded-4xl border border-ink/10 bg-white p-6 shadow-soft">
              <div className="flex flex-wrap items-center gap-3">
                {video.previous_video_id ? (
                  <Button href={`/subjects/${video.subject_id}/video/${video.previous_video_id}`} variant="secondary">
                    Previous
                  </Button>
                ) : null}
                {video.next_video_id ? (
                  <Button
                    disabled={isPending}
                    onClick={() => {
                      startTransition(() => {
                        router.push(`/subjects/${video.subject_id}/video/${video.next_video_id}`);
                      });
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button onClick={() => setError("Course complete. You have finished the last available lesson.")}>
                    Finish course
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
    </div>
  );
}
