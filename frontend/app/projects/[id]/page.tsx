"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { publicApiFetch, apiFetchMaybeAuth } from "@/lib/apiClient";
import { Button } from "@/components/common/Button";
import type { Project, UserProject } from "@/lib/types";

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

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [userProject, setUserProject] = useState<UserProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [githubLink, setGithubLink] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const projectData = await publicApiFetch<Project>(`/projects/${id}`);
        setProject(projectData);

        // Try to fetch user project status
        try {
          const portfolio = await apiFetchMaybeAuth<UserProject[]>("/projects/portfolio");
          const up = portfolio.find(p => p.project_id === Number(id));
          if (up) {
            setUserProject(up);
            if (up.github_link) setGithubLink(up.github_link);
            if (up.project_notes) setNotes(up.project_notes);
          }
        } catch {
          // Likely not logged in or no user project yet
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  async function handleComplete() {
    if (!githubLink) {
      alert("Please provide a GitHub repository link.");
      return;
    }

    try {
      setCompleting(true);
      await apiFetchMaybeAuth("/projects/complete", {
        method: "POST",
        body: JSON.stringify({
          projectId: Number(id),
          githubLink,
          notes
        })
      });
      alert("Project completed! It's now in your portfolio.");
      router.push("/portfolio");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to complete project");
    } finally {
      setCompleting(false);
    }
  }

  if (loading) return <div className="p-20 text-center">Loading project details...</div>;
  if (!project) return <div className="p-20 text-center text-rose-500">Project not found.</div>;

  const steps = safeParse(project.steps_json);
  const skills = safeParse(project.skills_required_json);

  return (
    <main className="container mx-auto max-w-5xl px-4 py-12 md:px-6">
      <div className="space-y-12">
        <header className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-moss/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-moss">
              {project.technology}
            </span>
            <span className="rounded-full bg-ink/5 px-4 py-1 text-xs font-bold uppercase tracking-widest text-ink/60">
              {project.difficulty}
            </span>
          </div>
          <h1 className="text-4xl font-serif text-ink md:text-5xl lg:text-6xl">
            {project.title}
          </h1>
          <p className="max-w-3xl text-xl leading-relaxed text-ink/70">
            {project.description}
          </p>
        </header>

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold">Implementation Steps</h2>
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-4 rounded-3xl border border-ink/5 bg-white p-5 shadow-sm">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <p className="text-ink/80 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <div className="rounded-[2.2rem] border border-moss/15 bg-[#f6faf7] p-8 shadow-sm">
              <h3 className="text-xl font-semibold">Project Meta</h3>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-ink/45">Estimated Time</span>
                  <span className="font-semibold text-ink">{project.estimated_hours} Hours</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-ink/45">Skills required:</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                      <span key={skill} className="rounded-full border border-ink/10 bg-white px-3 py-1 text-xs text-ink/70">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10 space-y-6">
                {userProject?.status === "completed" ? (
                  <div className="rounded-2xl bg-emerald-100 p-4 text-center text-emerald-800">
                    <p className="text-sm font-bold uppercase tracking-widest">✅ Completed</p>
                    <a href={userProject.github_link!} target="_blank" className="mt-2 block text-xs underline decoration-emerald-500/30">
                       View on GitHub
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-ink/45">GitHub Repo Link</label>
                      <input 
                        type="url" 
                        placeholder="https://github.com/user/repo"
                        className="w-full rounded-2xl border border-ink/10 bg-white p-3 text-sm outline-none focus:border-moss"
                        value={githubLink}
                        onChange={(e) => setGithubLink(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-ink/45">Notes (Optional)</label>
                      <textarea 
                        placeholder="What did you learn?"
                        className="h-24 w-full rounded-2xl border border-ink/10 bg-white p-3 text-sm outline-none focus:border-moss resize-none"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleComplete}
                      disabled={completing}
                    >
                      {completing ? "Submitting..." : "Mark as Completed"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
