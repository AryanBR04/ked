"use client";

import { useEffect, useState } from "react";
import { ProjectCard } from "./ProjectCard";
import { publicApiFetch } from "@/lib/apiClient";
import type { Project } from "@/lib/types";
import { TOP_TECHNOLOGIES } from "@/lib/technologyCatalog";
import { Skeleton } from "@/components/common/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { FolderKanban } from "lucide-react";

export function ProjectsListing() {
  const [groupedProjects, setGroupedProjects] = useState<Record<string, Project[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingProjectId, setStartingProjectId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const data = await publicApiFetch<Project[]>("/projects/all");
        const grouped = data.reduce((acc, project) => {
          const tech = project.technology;
          if (!acc[tech]) acc[tech] = [];
          acc[tech].push(project);
          return acc;
        }, {} as Record<string, Project[]>);
        setGroupedProjects(grouped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load projects");
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  async function handleStartProject(projectId: number) {
    try {
      setStartingProjectId(projectId);
      const { apiFetchMaybeAuth } = await import("@/lib/apiClient");
      await apiFetchMaybeAuth("/projects/start", {
        method: "POST",
        body: JSON.stringify({ projectId })
      });
      // Redirect to the project details or show success
      window.location.href = `/projects/${projectId}`;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to start project. Please login first.");
    } finally {
      setStartingProjectId(null);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="rounded-[2.2rem] border border-ink/8 bg-white p-6 space-y-4">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState message={error} onRetry={() => window.location.reload()} />
    );
  }

  const technologies = Object.keys(groupedProjects);

  if (technologies.length === 0) {
    return (
      <EmptyState 
        title="No projects found yet"
        message="Our team is currently designing new challenges. Check back soon for exciting projects to build!"
        icon={FolderKanban}
        actionLabel="Go Home"
        actionHref="/"
        className="rounded-[2.2rem] border border-ink/8 bg-fog/30"
      />
    );
  }

  return (
    <div className="space-y-20">
      {technologies.map(tech => (
        <section key={tech} className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-serif text-ink">{tech} Projects</h2>
            <div className="h-px flex-1 bg-ink/10" />
            <span className="text-xs font-bold uppercase tracking-widest text-ink/30">
              {groupedProjects[tech].length} Challenges
            </span>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groupedProjects[tech].map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onStart={handleStartProject}
                isStarting={startingProjectId === project.id}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
