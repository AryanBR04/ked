import type { ReactNode } from "react";

export function Alert({
  title,
  children,
  tone = "neutral"
}: {
  title: string;
  children: ReactNode;
  tone?: "neutral" | "error" | "success";
}) {
  const toneClasses = {
    neutral: "border-ink/10 bg-white text-ink",
    error: "border-clay/20 bg-clay/10 text-ink",
    success: "border-moss/20 bg-moss/10 text-ink"
  };

  return (
    <div className={`rounded-3xl border p-4 ${toneClasses[tone]}`}>
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-2 text-sm text-ink/75">{children}</div>
    </div>
  );
}

