import { describe, expect, it } from "vitest";
import { playlistsForUserQuery } from "./playlistsForUserQuery";

describe("playlistsForUserQuery", () => {
  it("always filters by the given user id", () => {
    expect(playlistsForUserQuery(5).where).toEqual({ userId: 5 });
    expect(playlistsForUserQuery(7).where).toEqual({ userId: 7 });
  });
});
