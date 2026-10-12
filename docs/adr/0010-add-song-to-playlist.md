# ADR 0010: Adding a song creates a PlaylistSong row

* Status: Accepted
* Date: 2026-10-06

## Context

A listener can open their own playlist and play it ([ADR 0009](0009-open-playlist-by-id.md)). Songs on a list exist only as seed data. The join table `PlaylistSong` is unused by the app.

## Problem

How does a listener put one catalog song onto one playlist they own, without replacing the whole list?

## Options considered

### PUT the playlist with a new `items` array

The client must send every song. Two tabs can overwrite each other. A missed item deletes it. `items` is not a field; it is rows.

### POST `/api/playlists/[id]` with `{ songId }`

Works. The playlist URL then means both “the list” and “add a membership”. A later GET or PATCH on the same path gets crowded.

### POST `/api/playlists/[id]/songs` with `{ songId }`

The collection of memberships has its own door. The page still loads playlist detail on the server. No GET on this path yet.

## Decision

`POST /api/playlists/[id]/songs` with `{ songId }`. Session cookie supplies `userId`. `createPlaylistSong` checks `{ id, userId }` on `Playlist`, then inserts `PlaylistSong`.

* `NOT_FOUND` → 404 (missing or not yours, same as ADR 0009)
* `SONG_NOT_FOUND` → 404
* `ALREADY_IN_PLAYLIST` → 409 (`P2002`)
* `CREATED` → 201

The client never sends `userId`. Playlist does not import catalog. The route composes `playlistIdSchema` and `songIdSchema`.

## Consequences

### Positive

* One row, one request. Owner check cannot be skipped in this function.
* Duplicate membership is a conflict, not a second row.

### Negative

* The songs page still has no control that calls this. The door exists first.

## Revisit when

The catalog UI adds a song, or we need to remove or reorder memberships.
