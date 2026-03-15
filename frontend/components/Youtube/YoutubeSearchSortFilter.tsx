"use client";

import { YOUTUBE_SORT_OPTIONS, type YoutubeSortKey } from "@/lib/youtubeSort";

export function YoutubeSearchSortFilter({
  selected,
  onToggle
}: {
  selected: YoutubeSortKey[];
  onToggle: (value: YoutubeSortKey) => void;
}) {
  return (
    <details className="mt-4 rounded-[1.6rem] border border-ink/10 bg-white/80 p-4">
      <summary className="cursor-pointer list-none text-sm font-semibold text-ink">
        Sort by
        <span className="ml-2 text-xs font-normal uppercase tracking-[0.18em] text-ink/45">
          {selected.length
            ? selected
                .map((value) => YOUTUBE_SORT_OPTIONS.find((option) => option.value === value)?.label ?? value)
                .join(" • ")
            : "Default ranking"}
        </span>
      </summary>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {YOUTUBE_SORT_OPTIONS.map((option) => {
          const activeIndex = selected.indexOf(option.value);

          return (
            <button
              key={option.value}
              type="button"
              className={[
                "flex items-center justify-between rounded-[1.1rem] border px-4 py-3 text-left text-sm transition",
                activeIndex >= 0
                  ? "border-moss/25 bg-[#eef4ef] text-ink"
                  : "border-ink/10 bg-white text-ink/72 hover:border-ink/20 hover:bg-ink/5"
              ].join(" ")}
              onClick={() => onToggle(option.value)}
            >
              <span>{option.label}</span>
              <span className="text-xs uppercase tracking-[0.2em] text-ink/42">
                {activeIndex >= 0 ? `#${activeIndex + 1}` : "Off"}
              </span>
            </button>
          );
        })}
      </div>
    </details>
  );
}
