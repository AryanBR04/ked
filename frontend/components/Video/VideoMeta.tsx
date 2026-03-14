import { Button } from "@/components/common/Button";

export function VideoMeta({
  title,
  sectionTitle,
  description,
  previousVideoId,
  nextVideoId,
  subjectId
}: {
  title: string;
  sectionTitle: string;
  description: string | null;
  previousVideoId: number | null;
  nextVideoId: number | null;
  subjectId: number;
}) {
  return (
    <div className="rounded-4xl border border-ink/10 bg-white p-6 shadow-soft">
      <p className="text-xs uppercase tracking-[0.3em] text-ink/45">{sectionTitle}</p>
      <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
      {description ? <p className="mt-4 max-w-3xl text-base text-ink/70">{description}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        {previousVideoId ? (
          <Button href={`/subjects/${subjectId}/video/${previousVideoId}`} variant="secondary">
            Previous
          </Button>
        ) : null}
        {nextVideoId ? (
          <Button href={`/subjects/${subjectId}/video/${nextVideoId}`}>Next lesson</Button>
        ) : null}
      </div>
    </div>
  );
}

