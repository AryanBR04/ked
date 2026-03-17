"use client";

import { useState } from "react";
import { Button } from "@/components/common/Button";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
  onStart?: (projectId: number) => void;
  isStarting?: boolean;
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

export function ProjectCard({ project, onStart, isStarting }: ProjectCardProps) {
  const skills = safeParse(project.skills_required_json);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[2.2rem] border border-ink/8 bg-white p-6 transition-all hover:border-moss/35 hover:shadow-soft">
      <div className="flex items-start justify-between">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-ink/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/65">
            {project.technology}
          </span>
          <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] shadow-sm ${
            project.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700' :
            project.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' :
            'bg-rose-100 text-rose-700'
          }`}>
            {project.difficulty}
          </span>
        </div>
        <span className="text-xs font-medium text-ink/45">⏱ {project.estimated_hours}h</span>
      </div>

      <h3 className="mt-5 text-2xl font-semibold leading-tight group-hover:text-moss transition-colors">
        {project.title}
      </h3>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink/65">
        {project.description}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {skills.slice(0, 3).map(skill => (
          <span key={skill} className="rounded-full border border-ink/10 bg-fog/30 px-2.5 py-1 text-[11px] text-ink/55">
            #{skill}
          </span>
        ))}
        {skills.length > 3 && (
          <span className="text-[11px] text-ink/45 flex items-center">+{skills.length - 3} more</span>
        )}
      </div>

      <div className="mt-auto pt-8">
        <Button 
          variant="secondary" 
          onClick={() => onStart?.(project.id)}
          disabled={isStarting}
          className="w-full"
        >
          {isStarting ? "Starting..." : "Start Project"}
        </Button>
      </div>
    </article>
  );
}
