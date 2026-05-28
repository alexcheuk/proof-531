/**
 * Settings-row order for the four 5/3/1 lifts + display labels.
 *
 * Labels delegate to `liftProperName` in domain/labels rather than
 * duplicating the strings. LIFT_ORDER is kept as a local alias so
 * every consumer in this feature can stay unchanged.
 */
import { liftProperName } from '@/domain/labels';
import type { Lift } from '@/domain/types';

export const LIFT_ORDER: readonly Lift[] = ['squat', 'bench', 'deadlift', 'press'];

export interface LiftMeta {
  label: string;
}

export const LIFT_META: Record<Lift, LiftMeta> = {
  squat: { label: liftProperName('squat') },
  bench: { label: liftProperName('bench') },
  deadlift: { label: liftProperName('deadlift') },
  press: { label: liftProperName('press') },
};
