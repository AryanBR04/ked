"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { Alert } from "@/components/common/Alert";
import { Button } from "@/components/common/Button";
import { YoutubeCourseCard } from "@/components/Youtube/YoutubeCourseCard";
import { YoutubeSearchSortFilter } from "@/components/Youtube/YoutubeSearchSortFilter";
import { apiFetchMaybeAuth, publicApiFetch } from "@/lib/apiClient";
import { TOP_TECHNOLOGIES } from "@/lib/technologyCatalog";
import type {
  SubjectListItem,
  YoutubeCourseCollectionResponse,
  YoutubeSearchResponse,
  YoutubeTrendingResponse
} from "@/lib/types";
import { YOUTUBE_SORT_OPTIONS, type YoutubeSortKey } from "@/lib/youtubeSort";

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
    title: "Search a technology",
    description: "Pick from 100 core technologies, including languages, frameworks, cloud, AI, and dev tools."
  },
  {
    step: "02",
    title: "Open a ranked playlist",
    description: "The platform scores playlists by views, engagement, and recency before showing the top options."
  },
  {
    step: "03",
    title: "Resume like Netflix",
    description: "Your current lesson, completed count, and resume point stay synced to your account."
  }
];

const heroStats = [
  {
    value: "100",
    label: "Core technologies indexed",
    tone: "light"
  },
  {
    value: "Top 20",
    label: "Playlists per search",
    tone: "soft"
  },
  {
    value: "12h",
    label: "YouTube cache window",
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

function filterByPlaylistIds<T extends { playlist_id: string }>(items: T[], excluded: Set<string>) {
  return items.filter((item) => !excluded.has(item.playlist_id));
}

export default function HomePage() {
  const [subjects, setSubjects] = useState<SubjectListItem[]>([]);
  const [subjectLoading, setSubjectLoading] = useState(true);
  const [subjectError, setSubjectError] = useState<string | null>(null);
  const [continueLearning, setContinueLearning] = useState<YoutubeCourseCollectionResponse["items"]>([]);
  const [continueLoading, setContinueLoading] = useState(true);
  const [continueError, setContinueError] = useState<string | null>(null);
  const [trending, setTrending] = useState<YoutubeTrendingResponse["items"]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState<string | null>(null);
  const [recommended, setRecommended] = useState<YoutubeCourseCollectionResponse["items"]>([]);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [recommendedError, setRecommendedError] = useState<string | null>(null);
  const [newCourses, setNewCourses] = useState<YoutubeCourseCollectionResponse["items"]>([]);
  const [newCoursesLoading, setNewCoursesLoading] = useState(true);
  const [newCoursesError, setNewCoursesError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("Python");
  const [selectedSorts, setSelectedSorts] = useState<YoutubeSortKey[]>([]);
  const [searchResults, setSearchResults] = useState<YoutubeSearchResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, startSearchTransition] = useTransition();
  const continuePlaylistIds = new Set(continueLearning.map((course) => course.playlist_id));
  const visibleTrending = filterByPlaylistIds(trending, continuePlaylistIds);
  const recommendedExcluded = new Set([
    ...continuePlaylistIds,
    ...visibleTrending.map((course) => course.playlist_id)
  ]);
  const visibleRecommended = filterByPlaylistIds(recommended, recommendedExcluded);
  const newExcluded = new Set([
    ...recommendedExcluded,
    ...visibleRecommended.map((course) => course.playlist_id)
  ]);
  const visibleNewCourses = filterByPlaylistIds(newCourses, newExcluded);

  useEffect(() => {
    let cancelled = false;

    async function loadHomeData() {
      const [subjectResult, continueResult, trendingResult, recommendedResult, newResult] = await Promise.allSettled([
        publicApiFetch<SubjectListResponse>("/subjects?page=1&pageSize=12"),
        apiFetchMaybeAuth<YoutubeCourseCollectionResponse>("/youtube/continue-learning?limit=4"),
        apiFetchMaybeAuth<YoutubeTrendingResponse>("/youtube/trending?limit=8")
        ,
        apiFetchMaybeAuth<YoutubeCourseCollectionResponse>("/youtube/recommended?limit=4"),
        apiFetchMaybeAuth<YoutubeCourseCollectionResponse>("/youtube/new?limit=4")
      ]);

      if (cancelled) {
        return;
      }

      if (subjectResult.status === "fulfilled") {
        setSubjects(subjectResult.value.items);
      } else {
        setSubjectError(subjectResult.reason instanceof Error ? subjectResult.reason.message : "Failed to load courses.");
      }

      if (continueResult.status === "fulfilled") {
        setContinueLearning(continueResult.value.items);
      } else {
        setContinueError(
          continueResult.reason instanceof Error
            ? continueResult.reason.message
            : "Failed to load your continue-learning courses."
        );
      }

      if (trendingResult.status === "fulfilled") {
        setTrending(trendingResult.value.items);
      } else {
        setTrendingError(
          trendingResult.reason instanceof Error
            ? trendingResult.reason.message
            : "Failed to load trending tech playlists."
        );
      }

      if (recommendedResult.status === "fulfilled") {
        setRecommended(recommendedResult.value.items);
      } else {
        setRecommendedError(
          recommendedResult.reason instanceof Error
            ? recommendedResult.reason.message
            : "Failed to load recommended courses."
        );
      }

      if (newResult.status === "fulfilled") {
        setNewCourses(newResult.value.items);
      } else {
        setNewCoursesError(
          newResult.reason instanceof Error
            ? newResult.reason.message
            : "Failed to load new courses."
        );
      }

      setSubjectLoading(false);
      setContinueLoading(false);
      setTrendingLoading(false);
      setRecommendedLoading(false);
      setNewCoursesLoading(false);
    }

    void loadHomeData();

    return () => {
      cancelled = true;
    };
  }, []);

  function runSearch(technology: string) {
    const trimmed = technology.trim();

    if (!trimmed) {
      return;
    }

    startSearchTransition(() => {
      void (async () => {
        try {
          setSearchError(null);
          const sortQuery = selectedSorts.length ? `&sortBy=${selectedSorts.join(",")}` : "";
          const response = await apiFetchMaybeAuth<YoutubeSearchResponse>(
            `/youtube/search?tech=${encodeURIComponent(trimmed)}${sortQuery}`
          );
          setSearchResults(response);
        } catch (error) {
          setSearchResults(null);
          setSearchError(error instanceof Error ? error.message : "Search failed.");
        }
      })();
    });
  }

  function toggleSort(value: YoutubeSortKey) {
    setSelectedSorts((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-8 rounded-[2.75rem] border border-ink/10 bg-white/86 p-8 shadow-soft lg:grid-cols-[minmax(0,1.02fr)_430px] lg:p-10">
        <div className="flex h-full flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-ink/45">Netflix for coding courses</p>
            <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[0.95] md:text-6xl">
              Search ranked YouTube playlists and learn through them like a real course library.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">
              Discover curated playlists across 100 technologies, compare quality instantly, and resume from the last lesson you watched.
            </p>
            <form
              className="mt-8 rounded-[1.8rem] border border-moss/10 bg-[#f6faf7] p-4"
              onSubmit={(event) => {
                event.preventDefault();
                runSearch(searchValue);
              }}
            >
              <label className="text-xs uppercase tracking-[0.25em] text-ink/48" htmlFor="technology-search">
                Technology search
              </label>
              <div className="mt-3 flex flex-col gap-3 md:flex-row">
                <input
                  id="technology-search"
                  list="technology-catalog"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search Python, React, Docker, SQL, AI Agents..."
                  className="min-w-0 flex-1 rounded-full border border-ink/10 bg-white px-5 py-3 text-sm outline-none transition focus:border-moss/40"
                />
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? "Searching..." : "Search playlists"}
                </Button>
              </div>
              <datalist id="technology-catalog">
                {TOP_TECHNOLOGIES.map((technology) => (
                  <option key={technology} value={technology} />
                ))}
              </datalist>
              <div className="mt-4 flex flex-wrap gap-2">
                {TOP_TECHNOLOGIES.slice(0, 12).map((technology) => (
                  <button
                    key={technology}
                    type="button"
                    className="rounded-full border border-ink/10 bg-white px-3 py-1.5 text-sm text-ink/68 transition hover:border-moss/25 hover:bg-[#eef4ef]"
                    onClick={() => {
                      setSearchValue(technology);
                      runSearch(technology);
                    }}
                  >
                    {technology}
                  </button>
                ))}
              </div>
              <YoutubeSearchSortFilter selected={selectedSorts} onToggle={toggleSort} />
            </form>
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
              Discovery, ranking, playback, and resume in one loop.
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
                <p className="text-lg font-semibold">Rank</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ink/48">Best first</p>
              </div>
              <div className="rounded-[1.2rem] border border-moss/8 bg-white/72 p-3 text-center">
                <p className="text-lg font-semibold">Resume</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ink/48">Last lesson</p>
              </div>
              <div className="rounded-[1.2rem] border border-moss/8 bg-white/72 p-3 text-center">
                <p className="text-lg font-semibold">Cache</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ink/48">12 hours</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {searchError ? <Alert title="Search unavailable" tone="error">{searchError}</Alert> : null}
      {searchResults ? (
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Search results</p>
              <h2 className="mt-2 text-3xl font-semibold">{searchResults.technology} playlists worth starting</h2>
              {searchResults.sort_by.length ? (
                <p className="mt-2 text-sm text-ink/58">
                  Sorted by{" "}
                  {searchResults.sort_by
                    .map((value) => YOUTUBE_SORT_OPTIONS.find((option) => option.value === value)?.label ?? value)
                    .join(", ")}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink/45">
              <span className="rounded-full bg-ink/5 px-3 py-1.5">{searchResults.source}</span>
              <button
                type="button"
                className="rounded-full border border-ink/10 px-3 py-1.5 text-ink/62 transition hover:bg-white"
                onClick={() => setSearchResults(null)}
              >
                Clear
              </button>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {searchResults.items.map((course) => (
              <YoutubeCourseCard key={`${course.playlist_id}-${course.technology}`} course={course} />
            ))}
          </div>
        </section>
      ) : null}

      {continueError ? <Alert title="Continue learning unavailable" tone="error">{continueError}</Alert> : null}
      {continueLearning.length > 0 || continueLoading ? (
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Continue learning</p>
              <h2 className="mt-2 text-3xl font-semibold">Resume where you left off</h2>
            </div>
          </div>
          {continueLoading ? <p className="text-sm text-ink/55">Loading resume courses...</p> : null}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {continueLearning.map((course) => (
              <YoutubeCourseCard
                key={`${course.playlist_id}-${course.technology}-continue`}
                course={course}
                actionLabel="Resume playlist"
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Trending tech courses</p>
            <h2 className="mt-2 text-3xl font-semibold">Top-ranked playlists across the catalog</h2>
          </div>
          <Button
            variant="secondary"
            onClick={() => runSearch(searchValue)}
            disabled={isSearching}
          >
            Search current term
          </Button>
        </div>
        {trendingError ? <Alert title="Trending unavailable" tone="error">{trendingError}</Alert> : null}
        {trendingLoading ? <p className="text-sm text-ink/55">Loading trending playlists...</p> : null}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {visibleTrending.map((course) => (
            <YoutubeCourseCard key={`${course.playlist_id}-${course.technology}`} course={course} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Recommended courses</p>
            <h2 className="mt-2 text-3xl font-semibold">Strong next picks from the ranked library</h2>
          </div>
        </div>
        {recommendedError ? <Alert title="Recommendations unavailable" tone="error">{recommendedError}</Alert> : null}
        {recommendedLoading ? <p className="text-sm text-ink/55">Loading recommended courses...</p> : null}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {visibleRecommended.map((course) => (
            <YoutubeCourseCard key={`${course.playlist_id}-${course.technology}-recommended`} course={course} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-ink/45">New courses</p>
            <h2 className="mt-2 text-3xl font-semibold">Recently published playlists to explore next</h2>
          </div>
        </div>
        {newCoursesError ? <Alert title="New courses unavailable" tone="error">{newCoursesError}</Alert> : null}
        {newCoursesLoading ? <p className="text-sm text-ink/55">Loading new courses...</p> : null}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {visibleNewCourses.map((course) => (
            <YoutubeCourseCard key={`${course.playlist_id}-${course.technology}-new`} course={course} />
          ))}
        </div>
      </section>

      {subjectError ? <Alert title="Courses unavailable" tone="error">{subjectError}</Alert> : null}

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Structured subjects</p>
            <h2 className="mt-2 text-3xl font-semibold">Guided internal tracks already in the LMS</h2>
          </div>
        </div>
        {subjectLoading ? <p className="text-sm text-ink/55">Loading courses...</p> : null}
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
