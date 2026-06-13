import { useCallback, useEffect, useState } from 'react';

export type Phase =
  | 'idle'
  | 'title-type'
  | 'title-hold'
  | 'title-settle'
  | 'prev-type'
  | 'prev-hold'
  | 'tick-up'
  | 'numbers-settle'
  | 'final';

export type UsePrCelebrationSequenceOptions = {
  /** False when this is the user's first PR for this lift (no prev best). */
  hasComparison: boolean;
  /** True once the view data has loaded. Sequence waits for this before starting. */
  ready: boolean;
};

export type UsePrCelebrationSequenceResult = {
  phase: Phase;
  /** Caller passes this to the typewriter's onComplete for the title. */
  onTitleTyped: () => void;
  /** Caller passes this to the typewriter's onComplete for the prev block. */
  onPrevTyped: () => void;
  /** Caller passes this to the count-up's onComplete. */
  onTickComplete: () => void;
  /**
   * Fast-forward to the next *animated* phase, skipping any holds/settles
   * along the way. Wired to a tap on the surface (Discord 1508779690).
   * No-op once we're already at `final`.
   */
  skip: () => void;
};

/** Hold durations in ms. Tuned to feel deliberate without dragging. */
const TITLE_HOLD_MS = 450;
const TITLE_SETTLE_MS = 400;
const PREV_HOLD_MS = 900;
const NUMBERS_SETTLE_MS = 400;

export function usePrCelebrationSequence({
  hasComparison,
  ready,
}: UsePrCelebrationSequenceOptions): UsePrCelebrationSequenceResult {
  const [phase, setPhase] = useState<Phase>('idle');

  // Kick off when ready.
  useEffect(() => {
    if (!ready) return;
    if (phase !== 'idle') return;
    setPhase('title-type');
  }, [ready, phase]);

  // Time-based transitions: title-hold → title-settle → next.
  useEffect(() => {
    if (phase === 'title-hold') {
      const id = setTimeout(() => setPhase('title-settle'), TITLE_HOLD_MS);
      return () => clearTimeout(id);
    }
    if (phase === 'title-settle') {
      const next: Phase = hasComparison ? 'prev-type' : 'final';
      const id = setTimeout(() => setPhase(next), TITLE_SETTLE_MS);
      return () => clearTimeout(id);
    }
    if (phase === 'prev-hold') {
      const id = setTimeout(() => setPhase('tick-up'), PREV_HOLD_MS);
      return () => clearTimeout(id);
    }
    if (phase === 'numbers-settle') {
      const id = setTimeout(() => setPhase('final'), NUMBERS_SETTLE_MS);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [phase, hasComparison]);

  const onTitleTyped = useCallback(() => {
    setPhase((prev) => (prev === 'title-type' ? 'title-hold' : prev));
  }, []);

  const onPrevTyped = useCallback(() => {
    setPhase((prev) => (prev === 'prev-type' ? 'prev-hold' : prev));
  }, []);

  const onTickComplete = useCallback(() => {
    setPhase((prev) => (prev === 'tick-up' ? 'numbers-settle' : prev));
  }, []);

  // Tap-to-skip: jump to the next visible new animation. Holds/settles
  // collapse into the next animated phase. Mid-typewriter, this lets go
  // of the partial reveal  -  rendering already falls back to the full
  // value once `phase` advances past the type-phase.
  const skip = useCallback(() => {
    setPhase((prev) => {
      switch (prev) {
        case 'idle':
          return prev;
        case 'title-type':
        case 'title-hold':
        case 'title-settle':
          return hasComparison ? 'prev-type' : 'final';
        case 'prev-type':
        case 'prev-hold':
          return 'tick-up';
        case 'tick-up':
        case 'numbers-settle':
          return 'final';
        case 'final':
          return prev;
      }
    });
  }, [hasComparison]);

  return { phase, onTitleTyped, onPrevTyped, onTickComplete, skip };
}
