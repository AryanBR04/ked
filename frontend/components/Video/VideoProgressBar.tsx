export function VideoProgressBar({
  value,
  className
}: {
  value: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="h-2 rounded-full bg-ink/8">
        <div
          className="h-2 rounded-full bg-ink transition-all"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

