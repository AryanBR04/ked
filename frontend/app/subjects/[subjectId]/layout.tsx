"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SubjectSidebar } from "@/components/Sidebar/SubjectSidebar";

export default function SubjectLayout({
  children,
  params
}: {
  children: ReactNode;
  params: { subjectId: string };
}) {
  const subjectId = Number(params.subjectId);
  const pathname = usePathname();
  const videoMatch = pathname.match(/\/video\/(\d+)/);
  const activeVideoId = videoMatch ? Number(videoMatch[1]) : undefined;

  return (
    <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <SubjectSidebar subjectId={subjectId} activeVideoId={activeVideoId} />
      </div>
      <div>{children}</div>
    </div>
  );
}
