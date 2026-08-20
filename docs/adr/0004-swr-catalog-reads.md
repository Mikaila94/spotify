# ADR 0004: Use SWR for catalog client reads

* Status: Accepted
* Date: 2026-08-19

## Context

Catalog now has two authenticated client reads: the song list and per-song lyrics. Both need loading, error, retry, and ignore-stale-response behavior. The songs screen implemented lyrics loading by hand and copied the result into playback state.

Playback only needs audio commands. Lyrics are catalog data keyed by the selected song.

## Problem

We need a shared client-read convention so composition stays thin, stale lyrics requests are dropped when the selected song changes, and playback does not own catalog documents.

## Options considered

### Keep handmade `fetch` state in each component

This is explicit and has no extra dependency. It duplicated loading/error/retry machines and required a request-id guard plus `setTrackLyrics`.

### Catalog hooks without a library

A `useSongLyrics` hook would hide the mess from `SongsScreen` but we would still maintain the state machine ourselves, twice.

### TanStack Query

Stronger for mutations, normalized cache, and larger client stores. Heavier than the current read-only catalog needs.

### SWR keyed by resource URL

SWR already matched the documented open option. The song id is the cache key, so switching tracks drops the previous lyrics request. Loading, error, and retry are the same for list and lyrics.

## Decision

Use SWR for catalog client reads. Catalog owns `useSongs` and `useSongLyrics`. Fetchers throw `UnauthorizedError` on `401`; the UI redirects. Lyrics stay in the SWR cache and are passed into `LyricsPanel`. `PlayableTrack` remains an audio contract.

## Consequences

### Positive

* List and lyrics share one loading/error/retry convention.
* Stale lyrics responses are handled by key changes, not a request counter.
* Playback no longer stores lyric documents.
* `SongsScreen` composes selection, playback, and the lyrics query.

### Negative

* SWR is a new runtime dependency and a cache with default revalidation.
* Auth redirects remain UI behavior layered on thrown `401`s.
* Components that display lyrics must take query results as props or call the catalog hook.

## Revisit when

Consider TanStack Query if catalog gains mutations, shared optimistic updates, or many screens that need a mutation/cache lifecycle SWR does not express well. Disable or tune revalidation if background refetch becomes noisy for playback.
