export type Week = 1 | 2 | 3 | 4;

export type PrescribedSet = {
  percent: number;
  reps: number;
  weight: number;
  amrap: boolean;
};

export type PrescribedSetsOptions = {
  roundTo?: number;
};

type WeekScheme = {
  percents: readonly [number, number, number];
  reps: readonly [number, number, number];
  hasAmrap: boolean;
};

const SCHEMES: Record<Week, WeekScheme> = {
  1: { percents: [0.65, 0.75, 0.85], reps: [5, 5, 5], hasAmrap: true },
  2: { percents: [0.7, 0.8, 0.9], reps: [3, 3, 3], hasAmrap: true },
  3: { percents: [0.75, 0.85, 0.95], reps: [5, 3, 1], hasAmrap: true },
  4: { percents: [0.4, 0.5, 0.6], reps: [5, 5, 5], hasAmrap: false },
};

const VALID_WEEKS: readonly Week[] = [1, 2, 3, 4];

function isValidWeek(week: number): week is Week {
  return Number.isInteger(week) && (VALID_WEEKS as readonly number[]).includes(week);
}

function roundToNearest(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}

export function prescribedSets(
  trainingMax: number,
  week: Week,
  options: PrescribedSetsOptions = {},
): PrescribedSet[] {
  if (!(trainingMax > 0)) {
    throw new Error(`prescribedSets: trainingMax must be > 0, got ${trainingMax}`);
  }
  if (!isValidWeek(week)) {
    throw new Error(`prescribedSets: week must be 1, 2, 3, or 4, got ${week}`);
  }
  const roundTo = options.roundTo ?? 5;
  if (!(roundTo > 0)) {
    throw new Error(`prescribedSets: roundTo must be > 0, got ${roundTo}`);
  }

  const scheme = SCHEMES[week];
  return scheme.percents.map((percent, i) => {
    const reps = scheme.reps[i] as number;
    return {
      percent,
      reps,
      weight: roundToNearest(trainingMax * percent, roundTo),
      amrap: scheme.hasAmrap && i === scheme.percents.length - 1,
    };
  });
}
