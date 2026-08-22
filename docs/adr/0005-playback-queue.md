# ADR 0005: Playback owns an ordered session queue

* Status: Accepted
* Date: 2026-08-21

## Context

The persistent player lives in the protected layout. The catalog table lives on the songs screen. Skip must work from the bar, including after navigating away from `/songs`.

Playback already owns the current track. The current track does not know its neighbors. Neighbors exist only on an ordered list.

Playlist tables exist in the schema but have no workflow, so they stay unclaimed.

## Problem

The listener needs next and previous on the bar without clicking the table again. Skip must use a stable identity (`id`), not a stored row index. Playback must not import catalog. Catalog must not own audio.

## Options considered

### App composition computes skip beside the bar

A layout wrapper reads the catalog list from SWR and `currentTrack.id`, then calls `playTrack` on the neighbor. Playback stays one track. Skip depends on that list still being the session, and a later playlist would need the wrapper to know which list is active.

### Store a current index in playback, bounded by the catalog list

The index is derived state. It drifts when the list is refetched or reordered, and it makes playback depend on catalog length without owning the list.

### Playback owns a `PlayableTrack[]` queue

Application composition maps a source list to playback tracks and sets the queue when playback starts. Next and previous find the current id in that queue and move by one. Playback never stores an index. A future playlist screen would pass a different array into the same command.

## Decision

Playback owns an ordered session queue of `PlayableTrack`. `currentTrack.id` is the lookup key. Skip is a playback command. `app` maps catalog results into the queue when a song is selected.

Skip wraps: next on the last track plays the first, previous on the first plays the last. A queue of fewer than two tracks has nothing to skip to. Track end still pauses; it does not auto-advance.

Playback does not know about playlists. A playlist, when it exists, is another source of `PlayableTrack[]`.

## Consequences

### Positive

* The bar can skip without seeing the catalog table.
* The queue survives route changes inside the player shell.
* Catalog still only reports selection; playback still only speaks `PlayableTrack`.
* A later playlist workflow can reuse skip without a new playback primitive.

### Negative

* Playback is now a session (current track plus order), not only one track.
* The queue can disagree with a later catalog refetch until the listener selects again.

## Revisit when

A playlist or other source starts playback, a source wants repeat-off instead of wrap, or ended tracks should auto-advance. Reconsider composition-only skip only if a second source cannot share this queue shape.
