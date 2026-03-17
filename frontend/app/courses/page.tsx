"use client";

import { useEffect, useState, useTransition } from "react";
import { YoutubeSearchSortFilter } from "@/components/Youtube/YoutubeSearchSortFilter";
import { YoutubeCourseCard } from "@/components/Youtube/YoutubeCourseCard";
import { Skeleton } from "@/components/common/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/common/Button";
import { apiFetchMaybeAuth } from "@/lib/apiClient";
import { YoutubeSearchResponse, YoutubeTrendingResponse } from "@/lib/types";
import { type YoutubeSortKey } from "@/lib/youtubeSort";
import { useAuthStore } from "@/store/authStore";

const TOP_TECHNOLOGIES = [
  "Python", "JavaScript", "React", "Next.js", "Node.js", "TypeScript", 
  "Docker", "Kubernetes", "AWS", "Machine Learning", "Data Science", "SQL"
];

export default function CoursesPage() {
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<YoutubeSearchResponse | null>(null);
  const [trendingResults, setTrendingResults] = useState<YoutubeTrendingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedSorts, setSelectedSorts] = useState<YoutubeSortKey[]>([]);
  const [isSearching, startSearchTransition] = useTransition();

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        setSearchError(null);
        const trending = await apiFetchMaybeAuth<YoutubeTrendingResponse>("/youtube/trending");
        setTrendingResults(trending);
      } catch (err) {
        console.error("Failed to load trending courses:", err);
        setSearchError("Unable to load trending courses.");
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  function runSearch(technology: string) {
    const trimmed = technology.trim();
    if (!trimmed) {
      setSearchResults(null);
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
    <div className="space-y-12">
      <section className="rounded-[2.5rem] border border-ink/10 bg-white p-8 shadow-soft lg:p-12">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Course Discovery</p>
          <h1 className="mt-4 text-4xl font-semibold md:text-5xl">Browse Courses</h1>
          <p className="mt-4 text-lg text-ink/65">
            Discover high-quality YouTube programming courses ranked by our community and AI.
          </p>
        </div>

        <form
          className="mt-10 rounded-3xl border border-moss/10 bg-[#f6faf7] p-6"
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(searchValue);
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row">
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="What do you want to learn today?"
              className="min-w-0 flex-1 rounded-full border border-ink/10 bg-white px-6 py-4 text-base outline-none transition focus:border-moss/40"
            />
            <Button type="submit" disabled={isSearching}>
              {isSearching ? "Searching..." : "Search Courses"}
            </Button>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-2">
            {TOP_TECHNOLOGIES.map((tech) => (
              <button
                key={tech}
                type="button"
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  searchValue === tech 
                    ? "border-moss bg-moss text-fog" 
                    : "border-ink/10 bg-white text-ink/70 hover:border-moss/30"
                }`}
                onClick={() => {
                  setSearchValue(tech);
                  runSearch(tech);
                }}
              >
                {tech}
              </button>
            ))}
          </div>

          <div className="mt-6 border-t border-ink/5 pt-6">
            <YoutubeSearchSortFilter selected={selectedSorts} onToggle={toggleSort} />
          </div>
        </form>
      </section>

      {searchError && !isSearching && (
        <ErrorState 
          message={searchError} 
          onRetry={searchResults ? () => runSearch(searchValue) : () => window.location.reload()} 
        />
      )}

      {isSearching && (
        <section className="space-y-8">
          <div className="h-8 w-64 rounded-lg bg-ink/5 animate-pulse" />
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-[2rem] border border-ink/10 bg-white p-5 space-y-4">
                <Skeleton className="h-44 w-full rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-4 w-20 rounded-full" />
                </div>
                <Skeleton className="h-12 w-full rounded-full" />
              </div>
            ))}
          </div>
        </section>
      )}

      {searchResults && !isSearching && !searchError && (
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-ink">Search Results for "{searchResults.technology}"</h2>
            <p className="text-sm text-ink/45">{searchResults.items.length} courses found</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {searchResults.items.map((course) => (
              <YoutubeCourseCard key={course.playlist_id} course={course} />
            ))}
          </div>
        </section>
      )}

      {!searchResults && !isSearching && !searchError && (
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-ink">Trending Courses</h2>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-[2rem] border border-ink/10 bg-white p-5 space-y-4">
                  <Skeleton className="h-44 w-full rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-12 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : trendingResults?.items && trendingResults.items.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {trendingResults.items.map((course) => (
                <YoutubeCourseCard key={course.playlist_id} course={course} />
              ))}
            </div>
          ) : (
            <p className="text-center text-ink/45 italic py-12">No trending courses found.</p>
          )}
        </section>
      )}
    </div>
  );
}
