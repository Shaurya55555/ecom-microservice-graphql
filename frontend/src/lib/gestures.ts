/** Pure helpers behind the swipe / drag / double-tap interactions, kept separate so they're unit tested. */

export const DISMISS_DISTANCE = 100; // px dragged before a sheet closes on release
export const DISMISS_VELOCITY = 0.5; // px/ms — a quick flick closes it even if short
export const REMOVE_DISTANCE = 96; // px a cart row must be swiped to remove it
export const DRAG_SLOP = 8; // px of movement before we decide what the user is doing
export const DOUBLE_TAP_MS = 320;
export const DOUBLE_TAP_DISTANCE = 32;

/** Should a sheet that was dragged `distance` px in `elapsedMs` close on release? */
export function shouldDismiss(distance: number, elapsedMs: number): boolean {
  if (distance <= 0) return false;
  const velocity = elapsedMs > 0 ? distance / elapsedMs : 0;
  return distance >= DISMISS_DISTANCE || (distance >= 24 && velocity >= DISMISS_VELOCITY);
}

/**
 * Which way is the pointer moving? Returns null until it has moved past the slop, so a tap or a
 * tiny wobble is never mistaken for a swipe, and a vertical scroll never starts a horizontal drag.
 */
export function dragIntent(dx: number, dy: number, slop = DRAG_SLOP): "horizontal" | "vertical" | null {
  if (Math.abs(dx) < slop && Math.abs(dy) < slop) return null;
  return Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
}

export type TapPoint = { t: number; x: number; y: number };

export function isDoubleTap(prev: TapPoint | null, next: TapPoint): boolean {
  if (!prev) return false;
  return (
    next.t - prev.t <= DOUBLE_TAP_MS &&
    Math.hypot(next.x - prev.x, next.y - prev.y) <= DOUBLE_TAP_DISTANCE
  );
}

/** 0..1 progress of a leftward swipe, for fading the "Remove" reveal in. */
export function swipeProgress(dx: number, threshold = REMOVE_DISTANCE): number {
  return Math.min(Math.max(-dx / threshold, 0), 1);
}

/** Rubber-band: dragging further than `limit` gets progressively harder. */
export function rubberBand(dx: number, limit = REMOVE_DISTANCE * 1.5): number {
  const abs = Math.abs(dx);
  if (abs <= limit) return dx;
  return Math.sign(dx) * (limit + (abs - limit) * 0.25);
}
