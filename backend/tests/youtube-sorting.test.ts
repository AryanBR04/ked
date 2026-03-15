import { describe, expect, it } from "vitest";
import { buildYoutubeCourseOrderBy, parseYoutubeSortFields } from "../src/utils/youtubeSorting";

describe("youtube sorting", () => {
  it("parses comma-separated sort fields in the same order the user selected", () => {
    expect(parseYoutubeSortFields("views,likes,subscribers")).toEqual(["views", "likes", "subscribers"]);
  });

  it("deduplicates sort fields while preserving priority", () => {
    expect(parseYoutubeSortFields("views,likes,views,date")).toEqual(["views", "likes", "date"]);
  });

  it("builds the SQL order by clause from the selected sort fields", () => {
    expect(buildYoutubeCourseOrderBy(["views", "likes"])).toBe(
      "views DESC, likes DESC, ranking_score DESC, published_date DESC"
    );
    expect(buildYoutubeCourseOrderBy(["date"])).toBe(
      "published_date DESC, ranking_score DESC"
    );
  });
});
