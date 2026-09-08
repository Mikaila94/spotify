"use client";

import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import {
  FaPause,
  FaPlay,
  FaStepBackward,
  FaStepForward,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import { useAnimationFrame } from "@/shared/hooks/useAnimationFrame";
import { usePlayback } from "./PlaybackContext";

function formatTime(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function volumeFromClientX(bar: HTMLDivElement, clientX: number) {
  const rect = bar.getBoundingClientRect();
  if (rect.width === 0) {
    return 0;
  }

  return clamp01((clientX - rect.left) / rect.width);
}

function VolumeSlider({
  audioRef,
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>;
}) {
  const [volume, setVolume] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const lastAudibleVolume = useRef(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      setVolume(audio.volume);
      if (audio.volume > 0) {
        lastAudibleVolume.current = audio.volume;
      }
    }
  }, [audioRef]);

  function applyVolume(next: number) {
    const value = clamp01(next);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
    if (value > 0) {
      lastAudibleVolume.current = value;
    }
    setVolume(value);
  }

  function toggleMute() {
    if (volume > 0) {
      applyVolume(0);
      return;
    }

    applyVolume(lastAudibleVolume.current);
  }

  function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    if (!barRef.current) {
      return;
    }

    setIsDragging(true);
    applyVolume(volumeFromClientX(barRef.current, event.clientX));
  }

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    function handleMouseMove(event: MouseEvent) {
      if (!barRef.current) {
        return;
      }

      applyVolume(volumeFromClientX(barRef.current, event.clientX));
    }

    function handleMouseUp() {
      setIsDragging(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [audioRef, isDragging]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      applyVolume(volume - 0.05);
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      applyVolume(volume + 0.05);
    }
  }

  const percent = volume * 100;

  return (
    <Stack direction="row" gap={2} align="center">
      <Button
        aria-label={volume > 0 ? "Mute" : "Unmute"}
        variant="ghost"
        color="gray.400"
        borderRadius="full"
        w="28px"
        h="28px"
        minW="28px"
        p={0}
        cursor="pointer"
        onClick={toggleMute}
        _hover={{ color: "white", transform: "scale(1.1)" }}
        transition="transform 0.2s, color 0.2s"
      >
        {volume > 0 ? <FaVolumeUp size={14} /> : <FaVolumeMute size={14} />}
      </Button>
      <Box
        ref={barRef}
        role="slider"
        tabIndex={0}
        aria-label="Volume"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        w="100px"
        py={2}
        cursor="pointer"
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onKeyDown={handleKeyDown}
      >
        <Box
          position="relative"
          h={isHovering || isDragging ? "6px" : "4px"}
          bg="gray.600"
          borderRadius="full"
          transition="height 0.1s"
        >
          <Box
            w={`${percent}%`}
            h="100%"
            bg="green.500"
            borderRadius="full"
          />
          {(isHovering || isDragging) && (
            <Box
              position="absolute"
              left={`${percent}%`}
              top="50%"
              transform="translate(-50%, -50%)"
              w="14px"
              h="14px"
              bg="white"
              borderRadius="full"
              boxShadow="0 2px 8px rgba(0,0,0,0.4)"
            />
          )}
        </Box>
      </Box>
    </Stack>
  );
}

export function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    canSkip,
    togglePlayPause,
    playNext,
    playPrevious,
    audioRef,
    seek,
  } = usePlayback();
  const [displayTime, setDisplayTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const duration = currentTrack?.durationMs
    ? currentTrack.durationMs / 1000
    : 0;
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0;
  const currentTrackRef = useRef(currentTrack);
  const seekRef = useRef(seek);
  const durationRef = useRef(duration);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
    seekRef.current = seek;
    durationRef.current = duration;
  }, [currentTrack, seek, duration]);

  useEffect(() => {
    setDisplayTime(0);
  }, [currentTrack?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const syncDisplayTime = () => setDisplayTime(audio.currentTime);

    audio.addEventListener("timeupdate", syncDisplayTime);
    audio.addEventListener("seeked", syncDisplayTime);

    return () => {
      audio.removeEventListener("timeupdate", syncDisplayTime);
      audio.removeEventListener("seeked", syncDisplayTime);
    };
  }, [audioRef, currentTrack?.id]);

  useAnimationFrame(() => {
    if (audioRef.current) {
      setDisplayTime(audioRef.current.currentTime);
    }
  }, isPlaying || isDragging);

  function calculateTimeFromPosition(clientX: number) {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (x / rect.width) * durationRef.current;
  }

  function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    if (!currentTrackRef.current) return;
    setIsDragging(true);
    const newTime = calculateTimeFromPosition(event.clientX);
    seekRef.current(newTime);
    setDisplayTime(newTime);
  }

  useEffect(() => {
    if (!isDragging) return;

    function handleMouseMove(event: MouseEvent) {
      if (!currentTrackRef.current) return;
      const newTime = calculateTimeFromPosition(event.clientX);
      seekRef.current(newTime);
      setDisplayTime(newTime);
    }

    function handleMouseUp() {
      setIsDragging(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <Box p={4} h="80px">
      <Flex align="center" justify="space-between" h="100%">
        <Flex align="center" w="300px">
          <Box w="48px" h="48px" bg="gray.600" borderRadius="md" mr={3} />
          <Box>
            <Text color="white" fontSize="sm" fontWeight="medium">
              {currentTrack?.name || "No song playing"}
            </Text>
            <Text color="gray.400" fontSize="xs">
              {currentTrack?.artists
                .map((artist) => artist.name)
                .join(", ") || ""}
            </Text>
          </Box>
        </Flex>

        <Flex direction="column" align="center" flex="1" maxW="600px">
          <Stack direction="row" gap={4} mb={2} align="center">
            <Button
              aria-label="Previous"
              variant="ghost"
              color="white"
              borderRadius="full"
              w="32px"
              h="32px"
              minW="32px"
              p={0}
              onClick={playPrevious}
              disabled={!canSkip}
              _hover={{ transform: "scale(1.05)" }}
              transition="transform 0.2s"
            >
              <FaStepBackward size={14} />
            </Button>
            <Button
              aria-label="Play/Pause"
              variant="solid"
              colorScheme="green"
              borderRadius="full"
              w="40px"
              h="40px"
              minW="40px"
              p={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
              onClick={togglePlayPause}
              disabled={!currentTrack}
              _hover={{ transform: "scale(1.05)" }}
              transition="transform 0.2s"
            >
              {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
            </Button>
            <Button
              aria-label="Next"
              variant="ghost"
              color="white"
              borderRadius="full"
              w="32px"
              h="32px"
              minW="32px"
              p={0}
              onClick={playNext}
              disabled={!canSkip}
              _hover={{ transform: "scale(1.05)" }}
              transition="transform 0.2s"
            >
              <FaStepForward size={14} />
            </Button>
          </Stack>
          <Stack direction="row" gap={3} w="100%" align="center">
            <Text color="gray.400" fontSize="xs" minW="40px">
              {formatTime(displayTime)}
            </Text>
            <Box
              ref={progressBarRef}
              flex="1"
              py={2}
              cursor="pointer"
              onMouseDown={handleMouseDown}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <Box
                position="relative"
                h={isHovering || isDragging ? "6px" : "4px"}
                bg="gray.600"
                borderRadius="full"
                transition="height 0.1s"
              >
                <Box
                  w={`${progress}%`}
                  h="100%"
                  bg="green.500"
                  borderRadius="full"
                  position="relative"
                />
                {(isHovering || isDragging) && (
                  <Box
                    position="absolute"
                    left={`${progress}%`}
                    top="50%"
                    transform="translate(-50%, -50%)"
                    w="14px"
                    h="14px"
                    bg="white"
                    borderRadius="full"
                    boxShadow="0 2px 8px rgba(0,0,0,0.4)"
                    transition="transform 0.1s"
                    _hover={{ transform: "translate(-50%, -50%) scale(1.2)" }}
                  />
                )}
              </Box>
            </Box>
            <Text color="gray.400" fontSize="xs" minW="40px" textAlign="right">
              {formatTime(duration)}
            </Text>
          </Stack>
        </Flex>

        <Flex align="center" w="200px" justify="flex-end">
          <VolumeSlider audioRef={audioRef} />
        </Flex>
      </Flex>
    </Box>
  );
}
