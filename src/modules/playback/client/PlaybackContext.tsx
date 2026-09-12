"use client";

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { advance, canSkip, skip } from "../domain/queue";
import type { PlayableTrack } from "../public";
import { usePlaybackHotkeys } from "./usePlaybackHotkeys";

interface PlaybackContextValue {
  currentTrack: PlayableTrack | null;
  isPlaying: boolean;
  canSkip: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playTrack: (track: PlayableTrack, queue: PlayableTrack[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
}

const PlaybackContext = createContext<PlaybackContextValue | undefined>(
  undefined,
);

function trackChanged(
  previous: PlayableTrack | null,
  next: PlayableTrack | null,
) {
  return previous?.id !== next?.id;
}

function useAudioElement() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  return audioRef;
}

function useAudioPlayback(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  currentTrack: PlayableTrack | null,
  isPlaying: boolean,
  onPlaybackError: () => void,
) {
  const previousTrackRef = useRef<PlayableTrack | null>(null);
  const previousPlayingRef = useRef(false);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const didTrackChange = trackChanged(
      previousTrackRef.current,
      currentTrack,
    );
    const didPlayStateChange = previousPlayingRef.current !== isPlaying;

    const handlePlayError = (error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error("Playback failed:", error);
      onPlaybackError();
    };

    previousTrackRef.current = currentTrack;
    previousPlayingRef.current = isPlaying;

    if (!currentTrack) {
      audio.pause();
      return;
    }

    if (didTrackChange) {
      audio.pause();
      audio.src = currentTrack.url;

      if (isPlaying) {
        audio.play().catch(handlePlayError);
      }
      return;
    }

    if (didPlayStateChange) {
      if (isPlaying) {
        audio.play().catch(handlePlayError);
      } else {
        audio.pause();
      }
    }
  }, [audioRef, currentTrack, isPlaying, onPlaybackError]);
}

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlayableTrack | null>(null);
  const [queue, setQueue] = useState<PlayableTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useAudioElement();
  const handlePlaybackError = useCallback(() => setIsPlaying(false), []);

  useAudioPlayback(audioRef, currentTrack, isPlaying, handlePlaybackError);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    function handleEnded() {
      const next = advance(queue, currentTrack);
      if (next === null) {
        setIsPlaying(false);
        return;
      }

      setCurrentTrack(next);
      setIsPlaying(true);
    }

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [audioRef, queue, currentTrack]);

  function playTrack(track: PlayableTrack, nextQueue: PlayableTrack[]) {
    setCurrentTrack(track);
    setQueue(nextQueue);
    setIsPlaying(true);
  }

  function playAdjacent(delta: number) {
    const adjacent = skip(queue, currentTrack, delta);
    if (adjacent === null) {
      return;
    }

    setCurrentTrack(adjacent);
    setIsPlaying(true);
  }

  function togglePlayPause() {
    setIsPlaying((playing) => !playing);
  }

  function seek(time: number) {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }

  usePlaybackHotkeys({
    hasTrack: currentTrack !== null,
    onPlayPause: togglePlayPause,
    onNext: () => playAdjacent(1),
    onPrevious: () => playAdjacent(-1),
  });

  return (
    <PlaybackContext.Provider
      value={{
        currentTrack,
        isPlaying,
        canSkip: canSkip(queue, currentTrack),
        audioRef,
        playTrack,
        playNext: () => playAdjacent(1),
        playPrevious: () => playAdjacent(-1),
        togglePlayPause,
        seek,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const context = useContext(PlaybackContext);

  if (context === undefined) {
    throw new Error("usePlayback must be used within PlaybackProvider");
  }

  return context;
}
