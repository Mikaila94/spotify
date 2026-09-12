import { describe, expect, it } from "vitest";
import { playbackHotkey } from "./hotkeys";

const page = { typing: false, button: false, slider: false };
const field = { typing: true, button: false, slider: false };
const button = { typing: false, button: true, slider: false };
const slider = { typing: false, button: false, slider: true };

describe("playbackHotkey", () => {
  it("maps space and arrows on the page", () => {
    expect(playbackHotkey(" ", page)).toBe("play-pause");
    expect(playbackHotkey("ArrowLeft", page)).toBe("previous");
    expect(playbackHotkey("ArrowRight", page)).toBe("next");
  });

  it("ignores keys while typing", () => {
    expect(playbackHotkey(" ", field)).toBeNull();
    expect(playbackHotkey("ArrowRight", field)).toBeNull();
  });

  it("leaves space to native buttons and arrows to the volume slider", () => {
    expect(playbackHotkey(" ", button)).toBeNull();
    expect(playbackHotkey("ArrowLeft", slider)).toBeNull();
    expect(playbackHotkey("ArrowRight", slider)).toBeNull();
  });

  it("ignores modifier shortcuts", () => {
    expect(playbackHotkey(" ", page, { meta: true })).toBeNull();
    expect(playbackHotkey("ArrowRight", page, { ctrl: true })).toBeNull();
  });
});
