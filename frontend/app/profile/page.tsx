"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/Auth/AuthGuard";
import { Alert } from "@/components/common/Alert";
import { Button } from "@/components/common/Button";
import { apiFetchWithAuth, publicApiFetch } from "@/lib/apiClient";
import type { SubjectListItem, SubjectProgress } from "@/lib/types";
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await publicApiFetch<SubjectListResponse>("/subjects?page=1&pageSize=20");
        const progress = await Promise.all(
          response.items.map(async (subject) => ({
            ...subject,
            ...(await apiFetchWithAuth<SubjectProgress>(`/progress/subjects/${subject.id}`))
          }))
        );

        if (!cancelled) {
          setProgressCards(progress);
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
              <p className="mt-3 text-sm text-ink/65">
                {subject.completed_videos} of {subject.total_videos} lessons completed
              </p>
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

