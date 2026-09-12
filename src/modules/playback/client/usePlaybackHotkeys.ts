"use client";

import { useEffect, useRef } from "react";
import {
  type PlaybackHotkey,
  playbackHotkey,
  type HotkeyTargetKind,
} from "../domain/hotkeys";

interface PlaybackHotkeyHandlers {
  hasTrack: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

function hotkeyTargetKind(target: EventTarget | null): HotkeyTargetKind {
  if (!(target instanceof HTMLElement)) {
    return { typing: false, button: false, slider: false };
  }

  const typing =
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT";

  return {
    typing,
    button: target.closest("button, a, [role='button']") !== null,
    slider: target.closest("[role='slider']") !== null,
  };
}

export function usePlaybackHotkeys(handlers: PlaybackHotkeyHandlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat) {
        return;
      }

      const action = playbackHotkey(event.key, hotkeyTargetKind(event.target), {
        ctrl: event.ctrlKey,
        meta: event.metaKey,
        alt: event.altKey,
      });

      if (action === null) {
        return;
      }

      runHotkey(action, event, handlersRef.current);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}

function runHotkey(
  action: PlaybackHotkey,
  event: KeyboardEvent,
  handlers: PlaybackHotkeyHandlers,
) {
  if (action === "play-pause") {
    if (!handlers.hasTrack) {
      return;
    }

    event.preventDefault();
    handlers.onPlayPause();
    return;
  }

  event.preventDefault();

  if (action === "next") {
    handlers.onNext();
    return;
  }

  handlers.onPrevious();
}
