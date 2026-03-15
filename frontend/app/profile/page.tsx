"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/Auth/AuthGuard";
import { Alert } from "@/components/common/Alert";
import { Button } from "@/components/common/Button";
import { YoutubeCourseCard } from "@/components/Youtube/YoutubeCourseCard";
import { apiFetchWithAuth, publicApiFetch } from "@/lib/apiClient";
import { ProgressBar } from "@/components/common/ProgressBar";
import type { SubjectListItem, SubjectProgress, YoutubeCourseCollectionResponse } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";

interface SubjectListResponse {
  items: SubjectListItem[];
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const user = useAuthStore((state) => state.user)!;
  const [progressCards, setProgressCards] = useState<Array<SubjectListItem & SubjectProgress>>([]);
  const [continueLearning, setContinueLearning] = useState<YoutubeCourseCollectionResponse["items"]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [response, continueResponse] = await Promise.all([
          publicApiFetch<SubjectListResponse>("/subjects?page=1&pageSize=20"),
          apiFetchWithAuth<YoutubeCourseCollectionResponse>("/youtube/continue-learning?limit=6")
        ]);
        const progress = await Promise.all(
          response.items.map(async (subject) => ({
            ...subject,
            ...(await apiFetchWithAuth<SubjectProgress>(`/progress/subjects/${subject.id}`))
          }))
        );

        if (!cancelled) {
          setProgressCards(progress);
          setContinueLearning(continueResponse.items);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load profile.");
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-[2.5rem] border border-ink/10 bg-white p-8 shadow-soft">
        <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Profile</p>
        <h1 className="mt-3 text-4xl font-semibold">{user.name}</h1>
        <p className="mt-2 text-ink/65">{user.email}</p>
      </section>
      {error ? <Alert title="Profile data unavailable" tone="error">{error}</Alert> : null}
      {continueLearning.length ? (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Continue learning</p>
              <h2 className="mt-2 text-3xl font-semibold">Resume your YouTube playlists first</h2>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {continueLearning.map((course) => (
              <YoutubeCourseCard
                key={`${course.playlist_id}-${course.technology}-profile`}
                course={course}
                actionLabel="Resume playlist"
              />
            ))}
          </div>
        </section>
      ) : null}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Your progress</p>
            <h2 className="mt-2 text-3xl font-semibold">Resume where you left off</h2>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {progressCards.map((subject) => (
            <div key={subject.id} className="rounded-4xl border border-ink/10 bg-white p-6 shadow-soft">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/45">
                {subject.percent_complete}% complete
              </p>
              <h3 className="mt-3 text-2xl font-semibold">{subject.title}</h3>
              <div className="mt-4 rounded-[1.4rem] border border-moss/10 bg-[#f6faf7] p-3">
                <ProgressBar
                  completed={subject.completed_videos}
                  total={subject.total_videos}
                  percent={subject.percent_complete}
                />
              </div>
              <div className="mt-5">
                <Button
                  href={
                    subject.last_video_id
                      ? `/subjects/${subject.id}/video/${subject.last_video_id}`
                      : `/subjects/${subject.id}`
                  }
                >
                  Continue
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
