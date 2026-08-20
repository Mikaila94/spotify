# ADR 0003: Load lyrics after song selection

* Status: Accepted
* Date: 2026-08-19

## Context

Timed lyrics are stored as JSON on `Song` and shown beside the catalog after a track is selected. `GET /api/songs` previously included every song's lyric document in the list payload.

Browsing the catalog and following lyrics are different jobs. The table never uses lyrics. Playback can start as soon as a track is selected. Lyrics are optional follow-along content.

The current library is small, so payload size is not a measured problem. The list contract was still coupling two read models.

## Problem

The song list should stay a browse/play contract. Lyrics should load when a listener selects a track, without blocking audio and without downloading lyric documents for songs that are never played.

The solution should keep lyrics ownership in catalog, keep highlighting and seek in playback, and preserve the existing authenticated API boundary.

## Options considered

### Keep lyrics on the song list payload

One authenticated fetch, one loading path, and a simpler `PlayableTrack` mapping. Every list response reads and serializes lyrics for every song, including tracks the listener never selects. The list DTO serves two user jobs.

### Load lyrics only after selection

`GET /api/songs` omits lyrics. Selecting a track starts playback immediately, then `GET /api/songs/:id/lyrics` loads that song's timed lines. This adds a second request and a lyrics loading/error path.

### Fetch lyrics only when a lyrics panel is opened

This would match a future tab or hidden panel and avoid the lyrics request when the listener only wants audio. The current UI still shows lyrics beside the catalog, so the extra delay would be speculative UI work.

## Decision

Split the read models. The catalog list DTO does not include lyrics. Catalog owns `getSongLyrics` and the protected lyrics endpoint. Application composition starts playback from the list DTO. Lyrics load through a catalog read keyed by the selected song id and are not stored on `PlayableTrack`.

Empty lyrics remain a successful `[]`. A missing song is `404`. Invalid ids are `400`. The lyrics request uses the same session check as other music APIs.

## Consequences

### Positive

* The list query no longer reads lyric JSON.
* Playback is not blocked on lyrics.
* Rapid track changes ignore stale lyrics responses.
* Catalog still owns lyric content; playback still owns highlighting and seek.
* The list vs detail split is an explicit, interview-ready contract.

### Negative

* Selecting a song now has two loading paths.
* Lyrics can fail independently of audio.

## Revisit when

Consider fetching lyrics only when the listener opens a lyrics tab or panel, combining lyrics into a song-detail endpoint if more per-song fields are needed, or returning lyrics on the list again only if the extra request becomes a measured product problem.
