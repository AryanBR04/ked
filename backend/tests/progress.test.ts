import { describe, expect, it } from "vitest";
import { capProgressPosition } from "../src/utils/progress";

describe("capProgressPosition", () => {
  it("never stores a negative progress value", () => {
    expect(capProgressPosition(-12, 500, false)).toBe(0);
  });

  it("caps progress to the known duration", () => {
    expect(capProgressPosition(650, 500, false)).toBe(500);
  });

  it("uses the full duration when a lesson is completed", () => {
    expect(capProgressPosition(120, 500, true)).toBe(500);
  });

  it("keeps the raw normalized value when duration is unknown", () => {
    expect(capProgressPosition(120, null, false)).toBe(120);
  });
});

