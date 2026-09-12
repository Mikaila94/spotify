# ADR 0006: Playlist module lists only the signed-in user's playlists

* Status: Accepted
* Date: 2026-09-12

## Context

`Playlist` and `PlaylistSong` exist in the database. Nobody used them in the app yet. The listener needs to see their own playlist names in the sidebar.

A playlist belongs to a user. The song library does not.

## Problem

Who owns playlist reads? How do we make sure the list is only *my* playlists?

## Options considered

### Catalog lists playlists

Catalog already loads songs. Mixing “everyone’s library” with “my lists” would blur ownership.

### App queries Prisma in the layout

Works for one screen. The next playlist feature would copy that query. No home for the “only this user” rule.

### A playlist module, session id from auth

Auth answers “who is logged in?” Playlist answers “which lists are theirs?” App glues them. Playlist does not import catalog.

## Decision

Add a `playlist` module. `listPlaylistsForUser(userId)` always takes a user id and queries `where: { userId }`.

`GET /api/playlists` and the player layout call `getSession()`, then pass `session.id`. The client never sends a user id.

Today we only show names. Opening a playlist must check that same owner on that row. `isPublic` is unused.

## Consequences

### Positive

* The owner filter has one home and a unit test.
* Catalog and playback stay out of playlist data.

### Negative

* A get-by-id handler can still forget the owner check. The list query does not protect that.

## Revisit when

We open a playlist, add songs, or show public lists.
