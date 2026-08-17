"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { SongDTO } from "@/types/song";



interface MusicPlayerContextType {
  currentSong: SongDTO | null;
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  setCurrentSong: (song: SongDTO) => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

// Pure helper: determine if song changed
const songChanged = (prev: SongDTO | null, next: SongDTO | null): boolean => 
  prev?.id !== next?.id;

// Custom hook: manages audio element lifecycle
const useAudioElement = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  return audioRef;
};

// Custom hook: handles audio playback logic
const useAudioPlayback = (
  audioRef: React.RefObject<HTMLAudioElement | null>,
  currentSong: SongDTO | null,
  isPlaying: boolean,
  onPlaybackError: () => void
) => {
  const prevSongRef = useRef<SongDTO | null>(null);
  const prevPlayingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const didSongChange = songChanged(prevSongRef.current, currentSong);
    const didPlayStateChange = prevPlayingRef.current !== isPlaying;

    const handlePlayError = (error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error("Playback failed:", error);
      onPlaybackError();
    };

    prevSongRef.current = currentSong;
    prevPlayingRef.current = isPlaying;

    if (!currentSong) {
      audio.pause();
      return;
    }

    // Song changed - load new source
    if (didSongChange) {
      audio.pause();
      audio.src = currentSong.url;
      
      if (isPlaying) {
        audio.play().catch(handlePlayError);
      }
      return;
    }

    // Only play state changed
    if (didPlayStateChange) {
      if (isPlaying) {
        audio.play().catch(handlePlayError);
      } else {
        audio.pause();
      }
    }
  }, [currentSong, isPlaying, audioRef, onPlaybackError]);
};

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<SongDTO | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useAudioElement();

  // Handle playback errors
  const handlePlaybackError = useCallback(() => setIsPlaying(false), []);

  useAudioPlayback(audioRef, currentSong, isPlaying, handlePlaybackError);

  // Handle song ending
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    function handleEnded() {
      setIsPlaying(false);
    }

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [audioRef]);

  // Action: set song and auto-play
  const handleSetCurrentSong = (song: SongDTO) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  // Action: toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  // Action: seek to time
  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        audioRef,
        setCurrentSong: handleSetCurrentSong,
        togglePlayPause,
        seek,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error("useMusicPlayer must be used within MusicPlayerProvider");
  }
  return context;
}