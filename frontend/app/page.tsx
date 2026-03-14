"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Alert } from "@/components/common/Alert";
import { Button } from "@/components/common/Button";
import { publicApiFetch } from "@/lib/apiClient";
import type { SubjectListItem } from "@/lib/types";

interface SubjectListResponse {
  items: SubjectListItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

const learningFlow = [
  {
    step: "01",
    title: "Pick a subject",
    description: "Open a guided path in Java, Python, ML, or the next track you publish."
  },
  {
    step: "02",
    title: "Move lesson by lesson",
    description: "Each video unlocks in sequence, so students always know what comes next."
  },
  {
    step: "03",
    title: "Resume instantly",
    description: "Playback position, completion state, and next lesson stay synced to the account."
  }
];

const heroStats = [
  {
    value: "12",
    label: "Published courses",
    tone: "light"
  },
  {
    value: "Strict",
    label: "Lesson ordering",
    tone: "soft"
  },
  {
    value: "Resume",
    label: "Watch state saved",
    tone: "dark"
  }
] as const;

function courseInitials(title: string) {
  return title
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function HomePage() {
  const [subjects, setSubjects] = useState<SubjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await publicApiFetch<SubjectListResponse>("/subjects?page=1&pageSize=12");

        if (!cancelled) {
          setSubjects(response.items);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load courses.");
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
  }, []);

  return (
    <div className="space-y-10">
      <section className="grid gap-8 rounded-[2.75rem] border border-ink/10 bg-white/86 p-8 shadow-soft lg:grid-cols-[minmax(0,1.02fr)_430px] lg:p-10">
        <div className="flex h-full flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-ink/45">Build skills with flow</p>
            <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[0.95] md:text-6xl">
              Structured courses that turn YouTube lessons into real learning paths.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">
              Browse curated subjects, follow lessons in strict order, and pick up exactly where you left off.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/auth/register">Start learning</Button>
              <Button href="/auth/login" variant="secondary">I already have an account</Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-2 text-sm text-ink/58">
              <span className="rounded-full border border-ink/10 bg-[#f2efe8] px-3 py-1.5">YouTube-powered lessons</span>
              <span className="rounded-full border border-ink/10 bg-[#f2efe8] px-3 py-1.5">Resume tracking</span>
              <span className="rounded-full border border-ink/10 bg-[#f2efe8] px-3 py-1.5">Strict unlock flow</span>
            </div>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className={[
                  "rounded-[1.6rem] border p-5",
                  item.tone === "dark"
                    ? "border-moss bg-moss text-fog"
                    : item.tone === "soft"
                      ? "border-moss/12 bg-[#edf3ee] text-ink"
                      : "border-ink/10 bg-[#f5efe3] text-ink"
                ].join(" ")}
              >
                <p className="text-2xl font-semibold">{item.value}</p>
                <p className={`mt-2 text-sm ${item.tone === "dark" ? "text-fog/78" : "text-ink/62"}`}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[2.2rem] border border-moss/12 bg-[linear-gradient(180deg,#eef4ef_0%,#f7f4ed_52%,#ffffff_100%)] p-6">
          <div className="absolute -right-8 top-2 h-28 w-28 rounded-full bg-white/45 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-moss/10 blur-2xl" />
          <div className="relative flex h-full flex-col">
            <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Learning flow</p>
            <h2 className="mt-3 max-w-sm text-3xl font-semibold leading-tight">
              A simple loop students can follow without friction.
            </h2>
            <div className="mt-6 space-y-3">
              {learningFlow.map((item) => (
                <div
                  key={item.step}
                  className="rounded-[1.45rem] border border-moss/10 bg-white/78 p-4 backdrop-blur"
                >
                  <div className="flex items-start gap-4">
                    <span className="rounded-full bg-ink px-3 py-1 text-[11px] tracking-[0.25em] text-fog">
                      {item.step}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-ink/68">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-[1.2rem] border border-moss/8 bg-white/72 p-3 text-center">
                <p className="text-lg font-semibold">Lock</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ink/48">Order</p>
              </div>
              <div className="rounded-[1.2rem] border border-moss/8 bg-white/72 p-3 text-center">
                <p className="text-lg font-semibold">Resume</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ink/48">State</p>
              </div>
              <div className="rounded-[1.2rem] border border-moss/8 bg-white/72 p-3 text-center">
                <p className="text-lg font-semibold">Track</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ink/48">Progress</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error ? <Alert title="Courses unavailable" tone="error">{error}</Alert> : null}

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Published subjects</p>
            <h2 className="mt-2 text-3xl font-semibold">Pick a course and begin</h2>
          </div>
        </div>
        {loading ? <p className="text-sm text-ink/55">Loading courses...</p> : null}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subject) => (
            <article
              key={subject.id}
              className="rounded-4xl border border-ink/10 bg-white p-6 shadow-soft"
            >
              <div className="relative h-44 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#edf3ee] via-fog to-white">
                {subject.thumbnail_url ? (
                  <Image
                    src={subject.thumbnail_url}
                    alt={`${subject.title} thumbnail`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1280px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl font-semibold text-ink/25">
                    {courseInitials(subject.title)}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/15 via-transparent to-transparent" />
              </div>
              <div className="mt-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-ink/5 px-3 py-1 text-xs uppercase tracking-[0.22em] text-ink/60">
                    {subject.category ?? "General"}
                  </span>
                  <span className="text-xs text-ink/45">{subject.instructor_name ?? "Instructor"}</span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold">{subject.title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink/68">{subject.description}</p>
                <div className="mt-5">
                  <Button href={`/subjects/${subject.id}`}>View course</Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
