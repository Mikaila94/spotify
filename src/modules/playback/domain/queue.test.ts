import { describe, expect, it } from "vitest";
import type { PlayableTrack } from "../public";
import { advance, canSkip, getAdjacentTrack, getNextTrack, skip } from "./queue";

function track(id: number): PlayableTrack {
  return {
    id,
    name: `Song ${id}`,
    durationMs: 1000,
    url: `/${id}.mp3`,
    artists: [{ name: "Artist" }],
  };
}

const queue = [track(1), track(2), track(3)];

describe("getAdjacentTrack", () => {
  it("returns the next track when the current id is in the queue", () => {
    expect(getAdjacentTrack(queue, 2, 1)).toEqual(track(3));
  });

  it("returns the previous track when the current id is in the queue", () => {
    expect(getAdjacentTrack(queue, 2, -1)).toEqual(track(1));
  });

  it("wraps from the last track to the first and from the first to the last", () => {
    expect(getAdjacentTrack(queue, 3, 1)).toEqual(track(1));
    expect(getAdjacentTrack(queue, 1, -1)).toEqual(track(3));
  });

  it("returns null when there is no neighbor to skip to", () => {
    expect(getAdjacentTrack(queue, 99, 1)).toBeNull();
    expect(getAdjacentTrack([], 1, 1)).toBeNull();
    expect(getAdjacentTrack([track(1)], 1, 1)).toBeNull();
  });
});

describe("canSkip", () => {
  it("is true when the current track sits in a queue with neighbors", () => {
    expect(canSkip(queue, track(2))).toBe(true);
  });

  it("is false when there is no current track or nowhere to skip", () => {
    expect(canSkip(queue, null)).toBe(false);
    expect(canSkip([track(1)], track(1))).toBe(false);
    expect(canSkip(queue, track(99))).toBe(false);
  });
});

describe("skip", () => {
  it("moves from the current track", () => {
    expect(skip(queue, track(2), 1)).toEqual(track(3));
    expect(skip(queue, null, 1)).toBeNull();
  });
});

describe("getNextTrack", () => {
  it("returns the following track and stops at the last", () => {
    expect(getNextTrack(queue, 1)).toEqual(track(2));
    expect(getNextTrack(queue, 2)).toEqual(track(3));
    expect(getNextTrack(queue, 3)).toBeNull();
  });

  it("returns null when the current id is not in the queue", () => {
    expect(getNextTrack(queue, 99)).toBeNull();
    expect(getNextTrack([], 1)).toBeNull();
    expect(getNextTrack([track(1)], 1)).toBeNull();
  });
});

describe("advance", () => {
  it("moves forward without wrapping", () => {
    expect(advance(queue, track(2))).toEqual(track(3));
    expect(advance(queue, track(3))).toBeNull();
    expect(advance(queue, null)).toBeNull();
  });
});
