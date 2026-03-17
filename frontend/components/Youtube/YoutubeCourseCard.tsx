import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/common/Button";
import { ProgressBar } from "@/components/common/ProgressBar";
import { getTimeAgo } from "@/lib/time";
import type { YoutubeCourseCardItem } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";
import { apiFetchWithAuth } from "@/lib/apiClient";

function formatCompact(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

export function YoutubeCourseCard({
  course,
  actionLabel = "Open playlist"
}: {
  course: YoutubeCourseCardItem;
  actionLabel?: string;
}) {
  const user = useAuthStore((state) => state.user);
  const [isSaved, setIsSaved] = useState(course.is_saved ?? false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("Please login to save courses.");
      return;
    }

    if (isLoading) return;

    // Optimistic update
    const previousState = isSaved;
    setIsSaved(!previousState);
    setIsLoading(true);

    try {
      const result = await apiFetchWithAuth<{ saved: boolean }>("/saved-courses/toggle", {
        method: "POST",
        body: JSON.stringify({ playlistId: course.playlist_id })
      });
      // Sync with actual result
      setIsSaved(result.saved);
    } catch (err) {
      console.error("Failed to toggle save:", err);
      // Revert on error
      setIsSaved(previousState);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-soft relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated">
      {user && (
        <button
          onClick={toggleSave}
          disabled={isLoading}
          className={`absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-all duration-300 hover:scale-110 active:scale-95 ${
            isSaved 
              ? "bg-moss border-moss text-white" 
              : "bg-white/90 border-ink/10 text-ink/40 hover:text-ink"
          }`}
          title={isSaved ? "Remove from saved" : "Save course"}
        >
          {isSaved ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 animate-in zoom-in duration-300">
              <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 animate-in zoom-in duration-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          )}
        </button>
      )}

      <div className="relative h-44 overflow-hidden bg-ink/5">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={`${course.title} thumbnail`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1280px) 100vw, 25vw"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xl font-semibold text-ink/35">
            {course.technology}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-ink/5 to-transparent transition-opacity duration-300 group-hover:opacity-40" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {!user && (
            <div className="rounded-full bg-white/88 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink">
              {course.technology}
            </div>
          )}
          {course.quality_score >= 5.2 ? (
            <div className="rounded-full bg-amber-400 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-ink shadow-sm">
              ⭐ Top Rated
            </div>
          ) : null}
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="line-clamp-2 text-xl font-semibold leading-snug group-hover:text-moss transition-colors">{course.title}</h3>
            <p className="mt-2 text-sm text-ink/62">{course.channel_name}</p>
            {course.published_date ? (
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-ink/42">
                Published: {getTimeAgo(course.published_date)}
              </p>
            ) : null}
          </div>
          <div className="rounded-full border border-ink/10 bg-[#eef4ef] px-3 py-1 text-xs font-medium text-ink/72">
            {course.video_count} videos
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-ink/58">
          <span className="rounded-full bg-ink/5 px-2.5 py-1">{formatCompact(course.views)} views</span>
          <span className="rounded-full bg-ink/5 px-2.5 py-1">{formatCompact(course.likes)} likes</span>
          <span className="rounded-full bg-ink/5 px-2.5 py-1">
            {formatCompact(course.channel_subscribers)} subscribers
          </span>
        </div>
        {course.progress && course.progress.total_videos > 0 ? (
          <div className="rounded-[1.4rem] border border-moss/10 bg-[#f6faf7] p-3">
            <ProgressBar
              completed={course.progress.completed_videos}
              total={course.progress.total_videos}
              percent={course.progress.percent_complete}
            />
          </div>
        ) : null}
        <Button href={`/courses/youtube/${course.playlist_id}`} className="w-full">
          {course.progress?.completed_videos ? "Resume playlist" : actionLabel}
        </Button>
      </div>
    </article>
  );
}
