# ADR 0001: Keep high-frequency playback display state local

* Status: Accepted
* Date: 2026-08-16

## Context

The application has one shared `HTMLAudioElement` controlled through `MusicPlayerContext`. Song selection, play/pause state, seeking, the persistent player, and synchronized lyrics all depend on that playback session.

The context previously copied `audio.currentTime` into React state on every animation frame. Because the context value changed with each frame, every context consumer could rerender approximately 60 times per second, including the songs page, which does not use playback time.

The audio element is already the authoritative source of playback time. Elapsed time, progress position, and the active lyric are derived display values.

## Problem

We need shared playback controls across unrelated components without distributing high-frequency updates to components that do not need them.

The solution should remain understandable, avoid speculative infrastructure, preserve smooth progress updates, and keep seeking responsive while playing or paused.

## Options considered

### Keep all playback state in one context

This is the simplest state shape, but high-frequency time updates invalidate every consumer of the context. It couples unrelated UI to the audio clock.

### Split playback controls and time into separate contexts

This limits time updates to time consumers. It still promotes a derived audio value into global React state and adds another provider and contract.

### Use an external state store with selectors

Selectors could isolate updates and scale to more complex playback behavior. The current application does not yet need the dependency, conventions, or operational complexity.

### Keep shared controls global and derived time local

The context owns low-frequency shared state and commands: current song, playing state, the audio reference, song selection, play/pause, and seek. Components that display time sample the audio element locally at the frequency they require.

## Decision

Keep shared playback commands and low-frequency state in `MusicPlayerContext`. Keep high-frequency derived display state local to the components that render it.

`PlayerLayout` maintains local display time for its elapsed-time label and progress bar. It uses animation frames while playing or dragging, native audio events for external seeks, and immediate local updates during progress-bar interaction.

`LyricsDisplay` continues to sample the shared audio element locally and updates React state only when the active lyric changes.

The audio element remains the single source of truth for playback position.

## Consequences

### Positive

* The songs page no longer receives frame-by-frame context updates.
* Progress rendering remains smooth.
* Seeking while paused still produces immediate visual feedback.
* No additional state library or provider is required.
* State ownership reflects update frequency and consumer scope.

### Negative

* The player and lyrics each subscribe to the same audio clock.
* Components that need playback position must implement an appropriate local subscription.
* Context actions and the audio element remain coupled to browser playback APIs.

## Revisit when

Reconsider a selector-based store or shared subscription abstraction if many components need playback timing, playback state transitions become substantially more complex, profiling reveals performance problems, or playback must synchronize across browser tabs or devices.
