import { describe, expect, it } from "vitest";
import { parseLyrics } from "./lyrics";

describe("parseLyrics", () => {
  it("returns timed lines when the value is an array of time and text", () => {
    const lyrics = [
      { time: 0, text: "Hello" },
      { time: 1.5, text: "World" },
    ];

    expect(parseLyrics(lyrics)).toEqual(lyrics);
  });

  it("returns an empty array when there are no lines", () => {
    expect(parseLyrics([])).toEqual([]);
  });

  it("returns an empty array when the value is not lyrics", () => {
    expect(parseLyrics(null)).toEqual([]);
    expect(parseLyrics("not lyrics")).toEqual([]);
    expect(parseLyrics([{ time: 0 }])).toEqual([]);
  });
});
