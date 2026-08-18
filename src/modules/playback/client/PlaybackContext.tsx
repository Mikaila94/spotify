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
import type { PlayableTrack } from "../public";

interface PlaybackContextValue {
  currentTrack: PlayableTrack | null;
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playTrack: (track: PlayableTrack) => void;
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
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useAudioElement();
  const handlePlaybackError = useCallback(() => setIsPlaying(false), []);

  useAudioPlayback(audioRef, currentTrack, isPlaying, handlePlaybackError);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    function handleEnded() {
      setIsPlaying(false);
    }

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [audioRef]);

  function playTrack(track: PlayableTrack) {
    setCurrentTrack(track);
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

  return (
    <PlaybackContext.Provider
      value={{
        currentTrack,
        isPlaying,
        audioRef,
        playTrack,
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
