"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/Auth/AuthGuard";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { Button } from "@/components/common/Button";
import { YoutubeCourseCard } from "@/components/Youtube/YoutubeCourseCard";
import { apiFetchWithAuth, publicApiFetch } from "@/lib/apiClient";
import { ProgressBar } from "@/components/common/ProgressBar";
import { LearningAnalytics } from "@/components/Profile/LearningAnalytics";
import type { SubjectListItem, SubjectProgress, YoutubeCourseCardItem, YoutubeCourseCollectionResponse } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";
import { Bookmark, PlayCircle, FolderKanban } from "lucide-react";

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
  const [continueLearning, setContinueLearning] = useState<YoutubeCourseCardItem[]>([]);
  const [savedCourses, setSavedCourses] = useState<YoutubeCourseCardItem[]>([]);
  const [projectStats, setProjectStats] = useState<{ completed: number; in_progress: number }>({ completed: 0, in_progress: 0 });
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [response, continueResponse, savedResponse, analyticsResponse, statsResponse] = await Promise.all([
          publicApiFetch<SubjectListResponse>("/subjects?page=1&pageSize=20"),
          apiFetchWithAuth<YoutubeCourseCollectionResponse>("/youtube/continue-learning?limit=6"),
          apiFetchWithAuth<YoutubeCourseCardItem[]>("/saved-courses"),
          apiFetchWithAuth<any>("/learning-stats"),
          apiFetchWithAuth<{ completed: number; in_progress: number }>("/projects/stats")
        ]);
        
        const progress = await Promise.all(
          response.items.map(async (subject: SubjectListItem) => ({
            ...subject,
            ...(await apiFetchWithAuth<SubjectProgress>(`/progress/subjects/${subject.id}`))
          }))
        );

        if (!cancelled) {
          setProgressCards(progress);
          setContinueLearning(continueResponse.items);
          setSavedCourses(savedResponse.map(course => ({ ...course, is_saved: true })));
          setAnalytics(analyticsResponse);
          setProjectStats(statsResponse);
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
    <div className="space-y-8">
      <section className="rounded-[2.5rem] border border-ink/10 bg-white p-8 shadow-soft">
        <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Profile</p>
        <h1 className="mt-3 text-4xl font-semibold">{user.name}</h1>
        <p className="mt-2 text-ink/65">{user.email}</p>
      </section>

      {analytics ? <LearningAnalytics data={analytics} /> : (
        loading && <div className="h-48 rounded-4xl bg-white shadow-soft animate-pulse flex items-center justify-center text-ink/20">Loading learning analytics...</div>
      )}

      {error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : null}

      {!error && (
        <>
          {(loading || continueLearning.length > 0) && (
            <section className="space-y-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Continue learning</p>
                  <h2 className="mt-2 text-3xl font-semibold">Resume your YouTube playlists first</h2>
                </div>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="w-[400px] shrink-0 rounded-4xl border border-ink/10 bg-white p-5 space-y-4">
                      <Skeleton className="h-44 w-full rounded-2xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-12 w-full rounded-full" />
                    </div>
                  ))
                ) : (
                  continueLearning.slice(0, 6).map((course) => (
                    <div key={course.playlist_id} className="w-[400px] shrink-0">
                      <YoutubeCourseCard
                        key={`${course.playlist_id}-${course.technology}-profile`}
                        course={course}
                        actionLabel="Resume playlist"
                      />
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

      {progressCards.filter(p => p.completed_videos > 0 && p.completed_videos < p.total_videos).length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Your progress</p>
              <h2 className="mt-2 text-3xl font-semibold">Resume where you left off</h2>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {progressCards
              .filter(p => p.completed_videos > 0 && p.completed_videos < p.total_videos)
              .slice(0, 6)
              .map((subject) => (
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
      ) : null}

          {!loading && continueLearning.length === 0 && progressCards.filter(p => p.completed_videos > 0 && p.completed_videos < p.total_videos).length === 0 && (
            <EmptyState 
              title="No courses in progress"
              message="You haven't started any courses yet. Explore our catalog to find something that interests you."
              icon={PlayCircle}
              actionLabel="Browse Courses"
              actionHref="/courses"
              className="rounded-4xl border border-dashed border-ink/20 bg-ink/[0.02]"
            />
          )}

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Projects & Building</p>
                <h2 className="mt-2 text-3xl font-semibold">Your Portfolio Progress</h2>
              </div>
              <Button href="/portfolio" variant="secondary">View Portfolio</Button>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-4xl border border-ink/10 bg-white p-8 shadow-soft flex flex-col items-center justify-center text-center">
                 {loading ? <Skeleton className="h-12 w-16" /> : <span className="text-5xl font-serif text-moss">{projectStats.completed}</span>}
                 <p className="mt-2 text-sm font-bold uppercase tracking-widest text-ink/45">Completed Projects</p>
              </div>
              <div className="rounded-4xl border border-ink/10 bg-white p-8 shadow-soft flex flex-col items-center justify-center text-center">
                 {loading ? <Skeleton className="h-12 w-16" /> : <span className="text-5xl font-serif text-moss/60">{projectStats.in_progress}</span>}
                 <p className="mt-2 text-sm font-bold uppercase tracking-widest text-ink/45">Projects In Progress</p>
              </div>
              <div className="rounded-4xl border border-ink/10 bg-white p-8 shadow-soft flex flex-col items-center justify-center text-center">
                 <Button href="/projects">Find Projects</Button>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Collections</p>
                <h2 className="mt-2 text-3xl font-semibold">Saved Courses</h2>
              </div>
              {savedCourses.length > 0 && (
                <Button href="/courses" variant="secondary">Browse More</Button>
              )}
            </div>
            
            {(loading || savedCourses.length > 0) ? (
              <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="w-[400px] shrink-0 rounded-4xl border border-ink/10 bg-white p-5 space-y-4">
                      <Skeleton className="h-44 w-full rounded-2xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-12 w-full rounded-full" />
                    </div>
                  ))
                ) : (
                  savedCourses.map((course) => (
                    <div key={course.playlist_id} className="w-[400px] shrink-0">
                      <YoutubeCourseCard
                        course={course}
                        actionLabel="Go to playlist"
                      />
                    </div>
                  ))
                )}
              </div>
            ) : (
              <EmptyState 
                title="No saved courses"
                message="Save courses to build your learning library and access them easily anytime."
                icon={Bookmark}
                actionLabel="Explore Courses"
                actionHref="/courses"
                className="rounded-4xl border border-dashed border-ink/20 bg-ink/[0.02]"
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}
