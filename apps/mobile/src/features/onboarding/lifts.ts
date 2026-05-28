/**
 * Onboarding-local lift constants.
 *
 * Not imported across features — cross-feature imports violate the boundary
 * rules. Display labels delegate to `liftProperName` from domain/labels
 * rather than duplicating the strings; the `italic` subtitle is onboarding-
 * specific and stays local.
 */
import { liftProperName } from '@/domain/labels';
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
  squat: { label: liftProperName('squat'), italic: 'the foundation' },
  bench: { label: liftProperName('bench'), italic: 'press from your chest' },
  deadlift: { label: liftProperName('deadlift'), italic: 'pick it up' },
  press: { label: liftProperName('press'), italic: 'press over your head' },
};
