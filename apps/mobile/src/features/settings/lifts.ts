/**
 * Canonical Settings-row order for the four 5/3/1 lifts + display labels.
 *
 * Ported from `~/Development/531-pwa/src/features/settings/lifts.ts`.
 * Duplicated locally rather than imported from onboarding (cross-feature
 * imports are forbidden — features/ owns its own composition).
 */
import type { Lift } from '@/domain/types';

export const LIFT_ORDER: readonly Lift[] = ['squat', 'bench', 'deadlift', 'press'];

export interface LiftMeta {
  /** Display label shown in headlines and rows. */
  label: string;
  /** Italic subtitle — unused in Settings today, kept for parity. */
  italic: string;
}

export const LIFT_META: Record<Lift, LiftMeta> = {
  squat: { label: 'Back squat', italic: 'the foundation' },
  bench: { label: 'Bench press', italic: 'press from your chest' },
  deadlift: { label: 'Deadlift', italic: 'pick it up' },
  press: { label: 'Overhead press', italic: 'press over your head' },
};
