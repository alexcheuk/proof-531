import { liftProperName } from '@/domain/labels';
import type { Lift } from '@/domain/types';

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
