import type { PlayableTrack } from "../public";

function trackAt(queue: PlayableTrack[], index: number): PlayableTrack {
  return queue[(index + queue.length) % queue.length];
}

export function canSkip(
  queue: PlayableTrack[],
  current: PlayableTrack | null,
): boolean {
  if (current === null || queue.length < 2) {
    return false;
  }

  return queue.some((track) => track.id === current.id);
}

export function getAdjacentTrack(
  queue: PlayableTrack[],
  currentId: number,
  delta: number,
): PlayableTrack | null {
  if (queue.length < 2) {
    return null;
  }

  const index = queue.findIndex((track) => track.id === currentId);
  if (index === -1) {
    return null;
  }

  return trackAt(queue, index + delta);
}

export function skip(
  queue: PlayableTrack[],
  current: PlayableTrack | null,
  delta: number,
): PlayableTrack | null {
  if (current === null) {
    return null;
  }

  return getAdjacentTrack(queue, current.id, delta);
}

export function getNextTrack(
  queue: PlayableTrack[],
  currentId: number,
): PlayableTrack | null {
  const index = queue.findIndex((track) => track.id === currentId);
  if (index === -1 || index === queue.length - 1) {
    return null;
  }

  return queue[index + 1];
}

export function advance(
  queue: PlayableTrack[],
  current: PlayableTrack | null,
): PlayableTrack | null {
  if (current === null) {
    return null;
  }

  return getNextTrack(queue, current.id);
}
