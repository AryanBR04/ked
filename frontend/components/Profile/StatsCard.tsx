import React from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  unit?: string;
}

export function StatsCard({ label, value, icon, unit }: StatsCardProps) {
  return (
    <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-soft transition-transform hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-ink/45">{label}</p>
        {icon && <div className="text-moss">{icon}</div>}
      </div>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-semibold text-ink">{value}</span>
        {unit && <span className="text-sm font-medium text-ink/45">{unit}</span>}
      </div>
    </div>
  );
}
