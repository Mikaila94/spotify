# ADR 0009: Opening a playlist fetches it by id and owner, and answers 404

* Status: Accepted
* Date: 2026-09-25

## Context

The sidebar listed playlist names ([ADR 0006](0006-playlist-ownership.md)). They were not clickable. Opening one means asking for a single row by id, which the list filter does not protect — ADR 0006 named that gap when it was written.

`/playlists/3` is a page, not a browser fetch. The player layout already reads session and playlist data on the server.

## Problem

A listener should open their own playlist and play it. Someone typing another id must not see a stranger's list, and must not learn whether that list exists.

## Options considered

### Check the owner, then fetch the row

Two queries: ask if the user owns it, then load it. The order can be forgotten by the next function that loads a playlist. The rule lives in the caller.

### Fetch by id, compare `userId` in the handler

Same weakness, one query. Every new call site repeats the comparison, and a missed one is a silent leak.

### Fetch by id *and* owner in one query

`where: { id, userId }`. There is no way to ask for the row without saying who is asking. No row means no access, and the caller has nothing to forget.

### 403 versus 404

403 confirms the playlist exists. Walking ids would map the table. 404 gives the same answer whether the row is missing or not yours.

### A `GET /api/playlists/[id]` endpoint

The page renders on the server and needs no browser fetch. An endpoint would be a second door with the same owner rule to get right. We add one when the browser actually needs playlist data after load.

## Decision

`playlistForUserQuery(playlistId, userId)` filters on both, and `getPlaylistForUser` returns `PlaylistDetail | null`.

The page at `/playlists/[id]` validates the id, calls that function with `session.id`, and calls `notFound()` when the result is null — so a bad id, a missing playlist, and someone else's playlist all answer 404.

No playlist detail endpoint. The page fetches on the server.

Playlist selects the song fields it renders (`id`, `name`, `durationMs`, `url`, artist names) through `PlaylistSong`. It does not import catalog.

`isPublic` stays unused.

## Consequences

### Positive

* The owner filter is part of the query, not a step a caller can skip. It has a unit test.
* Existence of other users' playlists is not observable.
* Tracks come back ordered by `position`, ready for the existing playback queue.

### Negative

* Two modules now read song columns. Catalog owns the library; playlist reads a narrow slice through its own join. A change to song fields can touch both.
* `PlaylistTrack` and `PlayableTrack` are structurally identical today. The screen passes tracks straight to `playTrack`. If playback's shape changes, this breaks at compile time and someone must decide on a mapper.

## Revisit when

The browser needs playlist data after load (then an endpoint, with the same query), we add or reorder songs in a playlist, or `isPublic` becomes a real feature.
