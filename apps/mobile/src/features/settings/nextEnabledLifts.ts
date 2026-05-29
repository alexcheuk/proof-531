import type { Lift } from '@/domain/types';
import { LIFT_ORDER } from './lifts';

export function nextEnabledLifts(current: readonly Lift[], lift: Lift): Lift[] {
  const isOn = current.includes(lift);
  if (isOn && current.length === 1) {
    // Same reference so callers can skip the write.
    return current as Lift[];
  }
  if (isOn) {
    return current.filter((l) => l !== lift);
  }
  const nextSet = new Set<Lift>([...current, lift]);
  return LIFT_ORDER.filter((l) => nextSet.has(l));
}
