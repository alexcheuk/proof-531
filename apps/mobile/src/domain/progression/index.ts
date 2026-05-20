export type LiftCategory = 'upper' | 'lower';

const UPPER_BUMP = 5;
const LOWER_BUMP = 10;

export function nextTrainingMax(current: number, category: LiftCategory): number {
  if (!Number.isFinite(current)) {
    throw new Error(`nextTrainingMax: current must be finite, got ${current}`);
  }
  if (current <= 0) return current;
  switch (category) {
    case 'upper':
      return current + UPPER_BUMP;
    case 'lower':
      return current + LOWER_BUMP;
    default:
      throw new Error(`nextTrainingMax: unknown category ${category}`);
  }
}

export function advanceCycle(state: { cycle: number; week: number }): { cycle: number; week: 1 } {
  if (!Number.isInteger(state.cycle) || state.cycle <= 0) {
    throw new Error(`advanceCycle: cycle must be positive integer, got ${state.cycle}`);
  }
  return { cycle: state.cycle + 1, week: 1 };
}
