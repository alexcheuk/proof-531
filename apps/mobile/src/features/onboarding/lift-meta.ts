import { epley } from '@/domain/e1rm';

export type LiftId = 'squat' | 'bench' | 'deadlift' | 'press';

export type OnboardingEntry = { weight: number; reps: number };

export const LIFT_ORDER: readonly LiftId[] = ['squat', 'bench', 'deadlift', 'press'];

export const LIFT_META: Record<LiftId, { label: string; short: string }> = {
  squat: { label: 'Squat', short: 'S' },
  bench: { label: 'Bench press', short: 'B' },
  deadlift: { label: 'Deadlift', short: 'D' },
  press: { label: 'Overhead press', short: 'P' },
};

/** Estimated 1RM using the Epley formula. Re-exports the pure domain helper. */
export function epley1RM(weight: number, reps: number): number {
  return epley(weight, reps);
}

/** Computes 5/3/1 training max from a 1RM estimate. Rounds to nearest 5. */
export function trainingMaxFrom1RM(oneRM: number): number {
  return Math.round((oneRM * 0.9) / 5) * 5;
}
