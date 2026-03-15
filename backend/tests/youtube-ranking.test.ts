import { describe, expect, it } from "vitest";
import { listYoutubeTechnologies } from "../src/modules/youtube/youtube.service";
import { calculateRecencyScore, calculateYoutubeRankingScore } from "../src/utils/youtubeRanking";

describe("youtube ranking", () => {
  it("returns the top 100 technology catalog", () => {
    const result = listYoutubeTechnologies();

    expect(result.items).toHaveLength(100);
    expect(result.items[0]?.label).toBe("Python");
    expect(result.items.some((item) => item.label === "JavaScript")).toBe(true);
    expect(result.items.some((item) => item.label === "Rust")).toBe(true);
    expect(result.items.some((item) => item.label === "Flutter")).toBe(true);
  });

  it("prefers newer playlists in recency scoring", () => {
    const now = new Date("2026-03-15T00:00:00.000Z");
    const recent = calculateRecencyScore("2025-03-15T00:00:00.000Z", now);
    const older = calculateRecencyScore("2020-03-15T00:00:00.000Z", now);

    expect(recent).toBeGreaterThan(older);
  });

  it("combines views, engagement, and recency into the ranking score", () => {
    const now = new Date("2026-03-15T00:00:00.000Z");
    const stronger = calculateYoutubeRankingScore({
      views: 150000,
      likes: 9000,
      publishedDate: "2025-09-15T00:00:00.000Z",
      now
    });
    const weaker = calculateYoutubeRankingScore({
      views: 40000,
      likes: 800,
      publishedDate: "2021-03-15T00:00:00.000Z",
      now
    });

    expect(stronger).toBeGreaterThan(weaker);
  });
});
