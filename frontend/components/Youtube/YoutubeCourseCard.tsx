"use client";

import Image from "next/image";
import { Button } from "@/components/common/Button";
import { ProgressBar } from "@/components/common/ProgressBar";
import { getTimeAgo } from "@/lib/time";
import type { YoutubeCourseCardItem } from "@/lib/types";

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
  return (
    <article className="overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-soft">
      <div className="relative h-44 overflow-hidden bg-ink/5">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={`${course.title} thumbnail`}
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xl font-semibold text-ink/35">
            {course.technology}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-ink/5 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-white/88 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink">
          {course.technology}
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="line-clamp-2 text-xl font-semibold leading-snug">{course.title}</h3>
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
        <Button href={`/course/youtube/${course.playlist_id}`}>
          {course.progress?.completed_videos ? "Resume playlist" : actionLabel}
        </Button>
      </div>
    </article>
  );
}
