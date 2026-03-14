import { describe, expect, it } from "vitest";
import { decorateVideoSequence } from "../src/utils/ordering";
import type { OrderedVideo } from "../src/types/domain";

const videos: OrderedVideo[] = [
  {
    id: 1,
    title: "Intro",
    section_id: 10,
    section_title: "Basics",
    section_order_index: 1,
    order_index: 1
  },
  {
    id: 2,
    title: "Variables",
    section_id: 10,
    section_title: "Basics",
    section_order_index: 1,
    order_index: 2
  },
  {
    id: 3,
    title: "Loops",
    section_id: 11,
    section_title: "Control Flow",
    section_order_index: 2,
    order_index: 1
  }
];

describe("decorateVideoSequence", () => {
  it("unlocks the first video by default", () => {
    const result = decorateVideoSequence(videos, new Set<number>());
    expect(result[0].locked).toBe(false);
    expect(result[1].locked).toBe(true);
  });

  it("unlocks the next video when the previous one is completed", () => {
    const result = decorateVideoSequence(videos, new Set<number>([1]));
    expect(result[1].locked).toBe(false);
    expect(result[2].locked).toBe(true);
  });

  it("includes previous and next ids for navigation", () => {
    const result = decorateVideoSequence(videos, new Set<number>([1, 2]));
    expect(result[1].previous_video_id).toBe(1);
    expect(result[1].next_video_id).toBe(3);
  });
});
