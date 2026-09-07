import { describe, expect, it } from "vitest";
import {
  computeWordOffsets,
  estimateWordDurationsMs,
  findActiveWordIndex,
} from "../src/lib/highlighter";

describe("computeWordOffsets", () => {
  it("offsets each word by the length of the words (plus joining space) before it", () => {
    // "one two three" joined with single spaces
    expect(computeWordOffsets(["one", "two", "three"])).toEqual([0, 4, 8]);
  });

  it("returns an empty list for no words", () => {
    expect(computeWordOffsets([])).toEqual([]);
  });
});

describe("findActiveWordIndex", () => {
  const offsets = computeWordOffsets(["one", "two", "three"]); // [0, 4, 8]

  it("finds the word containing the given char index", () => {
    expect(findActiveWordIndex(offsets, 0)).toBe(0);
    expect(findActiveWordIndex(offsets, 3)).toBe(0);
    expect(findActiveWordIndex(offsets, 4)).toBe(1);
    expect(findActiveWordIndex(offsets, 9)).toBe(2);
  });

  it("clamps to the last word for an index past the end", () => {
    expect(findActiveWordIndex(offsets, 999)).toBe(2);
  });

  it("clamps to the first word for a negative index", () => {
    expect(findActiveWordIndex(offsets, -1)).toBe(0);
  });
});

describe("estimateWordDurationsMs", () => {
  it("gives longer words more time", () => {
    const [short, long] = estimateWordDurationsMs(["a", "elephant"], 1);
    expect(long!).toBeGreaterThan(short!);
  });

  it("scales inversely with rate", () => {
    const [atNormalRate] = estimateWordDurationsMs(["hello"], 1);
    const [atDoubleRate] = estimateWordDurationsMs(["hello"], 2);
    expect(atDoubleRate!).toBeLessThan(atNormalRate!);
  });

  it("never returns a duration below the floor, even for tiny words or rates", () => {
    const [durationForTinyWord] = estimateWordDurationsMs(["a"], 10);
    expect(durationForTinyWord).toBeGreaterThanOrEqual(120);
  });
});
