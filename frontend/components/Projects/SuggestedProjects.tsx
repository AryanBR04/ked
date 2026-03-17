"use client";

import { useEffect, useState } from "react";
import { apiFetchMaybeAuth, publicApiFetch } from "@/lib/apiClient";
import { Button } from "@/components/common/Button";
import type { Project } from "@/lib/types";

interface SuggestedProjectsProps {
  technology: string;
}

function safeParse(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
}

export function SuggestedProjects({ technology }: SuggestedProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSuggested() {
      try {
        setLoading(true);
        // If tech is General or missing, use personalized recommendations
        const endpoint = (technology === "General" || !technology) 
          ? "/projects/recommended"
          : `/projects/suggested?tech=${encodeURIComponent(technology)}`;
        
        const data = await apiFetchMaybeAuth<Project[]>(endpoint);
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch suggested projects", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSuggested();
  }, [technology]);

  if (loading) return null;

  if (projects.length === 0) {
    if (technology === "General" || !technology) {
       return (
         <section className="rounded-[2.2rem] border border-dashed border-ink/20 bg-ink/[0.02] p-12 text-center">
           <p className="text-ink/65 italic">Complete courses to unlock recommended projects.</p>
           <Button href="/courses" className="mt-4" variant="secondary">Browse Courses</Button>
         </section>
       );
    }
    return null;
  }

  return (
    <section className="rounded-[2.2rem] border border-moss/20 bg-[#f0f7f1] p-8 shadow-soft">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-moss">Level Up</p>
          <h2 className="text-3xl font-serif text-ink">Ready to build something?</h2>
          <p className="text-ink/65">
            {technology === "General" || !technology 
              ? "Recommended projects based on your learning history." 
              : `Scale your ${technology} skills by building these suggested projects.`}
          </p>
        </div>
        <Button href="/projects" variant="secondary">View All Projects</Button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {projects.map(project => (
          <div key={project.id} className="group relative flex flex-col rounded-3xl border border-ink/5 bg-white p-5 transition-all hover:shadow-md">
            <h3 className="font-semibold text-ink group-hover:text-moss transition-colors">{project.title}</h3>
            <p className="mt-2 text-xs text-ink/50 line-clamp-2">{project.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink/30">
                {project.difficulty}
              </span>
              <Link href={`/projects/${project.id}`} className="text-xs font-bold text-moss underline underline-offset-4 decoration-moss/20">
                Start →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Interal Link import helper
import Link from "next/link";
