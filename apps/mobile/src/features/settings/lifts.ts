/**
 * Settings-row order for the four 5/3/1 lifts + display labels.
 *
 * Duplicated from onboarding (cross-feature imports are forbidden).
 */
import type { Lift } from '@/domain/types';

export const LIFT_ORDER: readonly Lift[] = ['squat', 'bench', 'deadlift', 'press'];

export interface LiftMeta {
  label: string;
}

export const LIFT_META: Record<Lift, LiftMeta> = {
  squat: { label: 'Back squat' },
  bench: { label: 'Bench press' },
  deadlift: { label: 'Deadlift' },
  press: { label: 'Overhead press' },
};
