"use client";

import { useEffect, useState } from "react";
import { apiFetchMaybeAuth } from "@/lib/apiClient";
import type { UserProject } from "@/lib/types";
import { Button } from "@/components/common/Button";

export default function PortfolioPage() {
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        setLoading(true);
        const data = await apiFetchMaybeAuth<UserProject[]>("/projects/portfolio");
        setProjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPortfolio();
  }, []);

  return (
    <main className="container mx-auto max-w-7xl px-4 py-12 md:px-6 lg:py-20">
      <div className="flex flex-col space-y-16">
        <header className="max-w-3xl space-y-4">
          <p className="text-xs uppercase tracking-[0.45em] text-ink/45">Your showcase</p>
          <h1 className="text-5xl font-serif text-ink md:text-6xl lg:text-7xl">
             Portfolio
          </h1>
          <p className="text-xl text-ink/70 leading-relaxed md:text-2xl">
            A collection of projects you've built and mastered. Share this with potential employers or use it to track your growth.
          </p>
        </header>

        {loading ? (
          <div className="p-20 text-center">Loading your portfolio...</div>
        ) : projects.length === 0 ? (
          <div className="rounded-[2.2rem] border border-ink/8 bg-fog/30 p-20 text-center">
            <p className="text-xl font-medium text-ink/45 underline decoration-moss/30 underline-offset-8 decoration-2 mb-8">
               You haven't completed any projects yet.
            </p>
            <Button href="/projects">Browse Projects</Button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {projects.map(project => (
              <article key={project.id} className="group relative flex flex-col gap-6 rounded-[2.5rem] border border-ink/10 bg-white p-8 shadow-soft transition-all hover:border-moss/40">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-ink/5 px-4 py-1 text-xs font-bold uppercase tracking-widest text-ink/50">
                    {project.project_technology}
                  </span>
                  <p className="text-xs text-ink/40">
                    Completed: {project.completed_at ? new Date(project.completed_at).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-semibold leading-tight group-hover:text-moss transition-colors">
                    {project.project_title}
                  </h3>
                  <p className="text-ink/65 leading-relaxed line-clamp-2">
                    {project.project_description}
                  </p>
                </div>
                
                {project.project_notes && (
                  <div className="rounded-2xl bg-fog/30 p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-ink/30 mb-2">My Notes</p>
                    <p className="text-sm text-ink/70 italic italic leading-relaxed">"{project.project_notes}"</p>
                  </div>
                )}

                <div className="mt-auto pt-4 flex gap-4">
                  <a 
                    href={project.github_link!} 
                    target="_blank" 
                    className="flex-1 rounded-2xl bg-ink p-4 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    View Repository
                  </a>
                  <Button variant="secondary" href={`/projects/${project.project_id}`} className="flex-1 p-4">
                    Project Specs
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
