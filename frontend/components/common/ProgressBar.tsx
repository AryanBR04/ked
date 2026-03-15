"use client";

function clampPercent(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

export function ProgressBar({
  completed,
  total,
  percent,
  className
}: {
  completed: number;
  total: number;
  percent: number;
  className?: string;
}) {
  return (
    <div className={["space-y-2", className ?? ""].join(" ")}>
      <div className="flex items-center justify-between gap-3 text-xs text-ink/62">
        <span>
          {completed} / {total} lessons completed
        </span>
        <span>{clampPercent(percent)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-moss/10">
        <div className="h-full rounded-full bg-moss" style={{ width: `${clampPercent(percent)}%` }} />
      </div>
    </div>
  );
}
