export type PlaybackHotkey = "play-pause" | "next" | "previous";

export interface HotkeyTargetKind {
  typing: boolean;
  button: boolean;
  slider: boolean;
}

export function playbackHotkey(
  key: string,
  target: HotkeyTargetKind,
  modifiers: { ctrl?: boolean; meta?: boolean; alt?: boolean } = {},
): PlaybackHotkey | null {
  if (modifiers.ctrl || modifiers.meta || modifiers.alt) {
    return null;
  }

  if (target.typing) {
    return null;
  }

  if (key === " " || key === "Spacebar") {
    if (target.button || target.slider) {
      return null;
    }

    return "play-pause";
  }

  if (target.slider) {
    return null;
  }

  if (key === "ArrowLeft") {
    return "previous";
  }

  if (key === "ArrowRight") {
    return "next";
  }

  return null;
}
