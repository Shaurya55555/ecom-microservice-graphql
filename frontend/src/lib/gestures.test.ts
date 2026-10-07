import { describe, expect, it } from "vitest";
import {
  DISMISS_DISTANCE,
  REMOVE_DISTANCE,
  dragIntent,
  isDoubleTap,
  rubberBand,
  shouldDismiss,
  swipeProgress,
} from "./gestures";

describe("shouldDismiss", () => {
  it("closes after a long drag, however slow", () => {
    expect(shouldDismiss(DISMISS_DISTANCE, 2000)).toBe(true);
    expect(shouldDismiss(DISMISS_DISTANCE + 50, 5000)).toBe(true);
  });
  it("closes after a short but fast flick", () => {
    expect(shouldDismiss(40, 50)).toBe(true); // 0.8 px/ms
  });
  it("springs back after a short slow drag", () => {
    expect(shouldDismiss(40, 1000)).toBe(false);
    expect(shouldDismiss(10, 5)).toBe(false); // fast but a tiny wobble
  });
  it("never closes when dragged the wrong way", () => {
    expect(shouldDismiss(-200, 100)).toBe(false);
    expect(shouldDismiss(0, 100)).toBe(false);
  });
});

describe("dragIntent", () => {
  it("is undecided until the pointer moves past the slop", () => {
    expect(dragIntent(3, 2)).toBeNull();
  });
  it("tells horizontal swipes from vertical scrolling", () => {
    expect(dragIntent(-30, 4)).toBe("horizontal");
    expect(dragIntent(5, 40)).toBe("vertical");
  });
});

describe("isDoubleTap", () => {
  const first = { t: 1000, x: 100, y: 100 };
  it("accepts two quick taps in the same spot", () => {
    expect(isDoubleTap(first, { t: 1200, x: 104, y: 98 })).toBe(true);
  });
  it("rejects slow taps, far-apart taps, and a first tap", () => {
    expect(isDoubleTap(first, { t: 1600, x: 100, y: 100 })).toBe(false);
    expect(isDoubleTap(first, { t: 1100, x: 300, y: 100 })).toBe(false);
    expect(isDoubleTap(null, { t: 1100, x: 100, y: 100 })).toBe(false);
  });
});

describe("swipeProgress / rubberBand", () => {
  it("maps a left swipe to 0..1 and ignores right swipes", () => {
    expect(swipeProgress(0)).toBe(0);
    expect(swipeProgress(-REMOVE_DISTANCE / 2)).toBeCloseTo(0.5);
    expect(swipeProgress(-REMOVE_DISTANCE * 3)).toBe(1);
    expect(swipeProgress(50)).toBe(0);
  });
  it("is 1:1 up to the limit, then resists", () => {
    expect(rubberBand(-50)).toBe(-50);
    const far = rubberBand(-400);
    expect(far).toBeLessThan(-REMOVE_DISTANCE * 1.5);
    expect(far).toBeGreaterThan(-400);
  });
});
