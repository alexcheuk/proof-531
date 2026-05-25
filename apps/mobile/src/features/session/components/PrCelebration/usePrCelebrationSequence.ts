import { useCallback, useEffect, useState } from 'react';

/**
 * Phase machine for the PR-celebration intro sequence.
 *
 *   idle          — pre-mount no-op state. Effect kicks in and advances to title-type.
 *   title-type    — typewriter writes "YOU HIT A NEW PR" + "STRONGER." centered, large.
 *   title-hold    — short pause after the title is fully typed.
 *   title-settle  — title crossfades from centered intro position to its final top-left
 *                   lockup (eyebrow + hero) so the numbers block has room below.
 *   prev-type     — typewriter writes "PREVIOUS BEST" + prior e1RM in the centered slot
 *                   the title just vacated.
 *   prev-hold     — short pause so the user can read the prior number.
 *   tick-up       — the label crossfades from "PREVIOUS BEST" to "NEW ESTIMATED 1RM"
 *                   and the number counts up from prev → new. Visually anchored in the
 *                   same centered slot.
 *   numbers-settle — the centered numbers block crossfades to its final
 *                    PrCelebrationNumbers position under the title.
 *   final         — comparison row + CTAs fade in. Sequence is done.
 *
 * Transitions that depend on substring length / value range (typewriter,
 * count-up) are driven externally — the consumer calls `advance()` from the
 * animation hook's onComplete. Time-based transitions (the two holds + the
 * two settles) are driven internally with timeouts so we don't have to
 * thread setTimeout through every render.
 *
 * `hasComparison === false` (this is the user's first PR for the lift —
 * there's no prior best to display) collapses the entire prev/tick/settle
 * chunk: after the title settles, the sequence jumps straight to `final`.
 */

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
  /** Snap back to `idle`; the ready-effect will then kick off the sequence again. */
  replay: () => void;
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

  const replay = useCallback(() => setPhase('idle'), []);

  return { phase, onTitleTyped, onPrevTyped, onTickComplete, replay };
}
