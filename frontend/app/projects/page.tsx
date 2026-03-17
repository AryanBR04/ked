"use client";

import { ProjectsListing } from "@/components/Projects/ProjectsListing";

export default function ProjectsPage() {
  return (
    <main className="container mx-auto max-w-7xl px-4 py-12 md:px-6 lg:py-20">
      <div className="flex flex-col space-y-16">
        <header className="max-w-3xl space-y-4">
          <h1 className="text-5xl font-serif text-ink md:text-6xl lg:text-7xl">
             Projects
          </h1>
          <p className="text-xl text-ink/70 leading-relaxed md:text-2xl">
            Real-world challenges designed to help you master modern technologies and build a standout developer portfolio.
          </p>
        </header>

        <ProjectsListing />
      </div>
    </main>
  );
}
