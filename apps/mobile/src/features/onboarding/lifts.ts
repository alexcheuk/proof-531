/**
 * Onboarding-local lift constants.
 *
 * Not imported across features — cross-feature imports violate the boundary
 * rules. `domain/labels.LIFTS` exposes the same squat → bench → deadlift →
 * press order, but features that need only the display metadata should keep
 * their own copy rather than depending on domain/labels for a UI concern.
 */
import type { Lift } from '@/domain/types';

/**
 * Canonical order of the four 5/3/1 lifts as shown in the onboarding
 * wizard. Onboarding-local — not imported across features.
 */
export const LIFT_ORDER: readonly Lift[] = ['squat', 'bench', 'deadlift', 'press'];

export interface LiftMeta {
  /** Display label shown in headlines and table rows (no trailing period). */
  label: string;
  /** Italic subtitle shown under the headline on Step 3 (no trailing period). */
  italic: string;
}

export const LIFT_META: Record<Lift, LiftMeta> = {
  squat: { label: 'Back squat', italic: 'the foundation' },
  bench: { label: 'Bench press', italic: 'press from your chest' },
  deadlift: { label: 'Deadlift', italic: 'pick it up' },
  press: { label: 'Overhead press', italic: 'press over your head' },
};
