"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/common/Alert";
import { Button } from "@/components/common/Button";
import { apiFetchWithAuth, publicApiFetch } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";

interface SubjectDetail {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  category: string | null;
  instructor_name: string | null;
}

export default function SubjectOverviewPage({
  params
}: {
  params: { subjectId: string };
}) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);
  const [isPending, startTransition] = useTransition();
  const [subject, setSubject] = useState<SubjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await publicApiFetch<SubjectDetail>(`/subjects/${params.subjectId}`);

        if (!cancelled) {
          setSubject(response);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load subject.");
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [params.subjectId]);

  function handleContinue() {
    startTransition(() => {
      void apiFetchWithAuth<{ video_id: number | null }>(`/subjects/${params.subjectId}/first-video`)
        .then((response) => {
          router.push(
            response.video_id
              ? `/subjects/${params.subjectId}/video/${response.video_id}`
              : `/subjects/${params.subjectId}`
          );
        })
        .catch((loadError) => {
          setError(loadError instanceof Error ? loadError.message : "Unable to open course.");
        });
    });
  }

  return (
    <div className="space-y-6">
      {error ? <Alert title="Unable to load subject" tone="error">{error}</Alert> : null}
      <section className="rounded-[2.5rem] border border-ink/10 bg-white p-8 shadow-soft">
        <p className="text-xs uppercase tracking-[0.35em] text-ink/45">{subject?.category ?? "Course"}</p>
        <h1 className="mt-3 text-4xl font-semibold">{subject?.title ?? "Loading..."}</h1>
        <p className="mt-3 max-w-3xl text-lg text-ink/68">{subject?.description}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-ink/55">
          <span>Instructor: {subject?.instructor_name ?? "TBA"}</span>
          <span>Strict lesson order enabled</span>
          <span>YouTube-powered playback</span>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {isBootstrapped && user ? (
            <Button onClick={handleContinue} disabled={isPending}>
              {isPending ? "Opening..." : "Start learning"}
            </Button>
          ) : (
            <Button href={`/auth/login?next=${encodeURIComponent(`/subjects/${params.subjectId}`)}`}>
              Sign in to continue
            </Button>
          )}
          <Button href="/" variant="secondary">Back to all courses</Button>
        </div>
      </section>
    </div>
  );
}
