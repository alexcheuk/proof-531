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
