import { describe, expect, it } from "vitest";
import { playlistForUserQuery } from "./playlistForUserQuery";

describe("playlistForUserQuery", () => {
  it("asks for the row by id and owner together", () => {
    expect(playlistForUserQuery(3, 5).where).toEqual({ id: 3, userId: 5 });
    expect(playlistForUserQuery(9, 2).where).toEqual({ id: 9, userId: 2 });
  });

  it("keeps the owner filter when the ids match", () => {
    expect(playlistForUserQuery(4, 4).where).toEqual({ id: 4, userId: 4 });
  });
});
