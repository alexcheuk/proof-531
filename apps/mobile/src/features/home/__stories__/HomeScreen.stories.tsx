import type { ReactElement } from 'react';
import { HomeScreen, type HomeScreenProps } from '../HomeScreen';

// Local Meta/StoryObj helpers — @storybook/react-native v8 does not re-export
// these from @storybook/react, so we define minimal CSF-3 shapes here (same
// pattern as src/features/navigation/__stories__/TabBar.stories.tsx).
type Meta<P> = {
  title: string;
  component: (props: P) => ReactElement;
};
type Story = {
  args?: Partial<HomeScreenProps>;
  render?: () => ReactElement;
};

// Props for each story mirror the canonical outputs of `seedDemo(stage)` in
// `src/data/db/seed.ts` (which itself mirrors design-reference's
// buildDemoSession). We derive props statically here because:
//   1. @storybook/react-native runs on-device with expo-sqlite; the seed
//      helpers depend on better-sqlite3 which only works under Node/jest.
//   2. The seed values are documented and stable — keeping props in lock-step
//      with seedDemo's stage definitions is sufficient for visual fixtures.
//      The matching jest tests in seed.test.ts already cover the seed paths.

// Top-set numbers are derived offline from `prescribedSets(tm, week)` so the
// stories don't depend on the runtime domain code path.

const freshStartLifts: HomeScreenProps['lifts'] = [
  {
    id: 'squat',
    label: 'Squat',
    trainingMax: 235,
    topWeight: 200,
    topReps: 5,
    amrap: true,
    pct: 0.85,
  },
  {
    id: 'bench',
    label: 'Bench',
    trainingMax: 175,
    topWeight: 150,
    topReps: 5,
    amrap: true,
    pct: 0.85,
  },
  {
    id: 'deadlift',
    label: 'Deadlift',
    trainingMax: 305,
    topWeight: 260,
    topReps: 5,
    amrap: true,
    pct: 0.85,
  },
  {
    id: 'press',
    label: 'Press',
    trainingMax: 115,
    topWeight: 100,
    topReps: 5,
    amrap: true,
    pct: 0.85,
  },
];

const midCycleLifts: HomeScreenProps['lifts'] = [
  {
    id: 'squat',
    label: 'Squat',
    trainingMax: 275,
    topWeight: 250,
    topReps: 3,
    amrap: true,
    pct: 0.9,
  },
  {
    id: 'bench',
    label: 'Bench',
    trainingMax: 195,
    topWeight: 175,
    topReps: 3,
    amrap: true,
    pct: 0.9,
  },
  {
    id: 'deadlift',
    label: 'Deadlift',
    trainingMax: 345,
    topWeight: 310,
    topReps: 3,
    amrap: true,
    pct: 0.9,
  },
];

const advancedLifts: HomeScreenProps['lifts'] = [
  {
    id: 'squat',
    label: 'Squat',
    trainingMax: 320,
    topWeight: 305,
    topReps: 1,
    amrap: true,
    pct: 0.95,
  },
  {
    id: 'bench',
    label: 'Bench',
    trainingMax: 220,
    topWeight: 210,
    topReps: 1,
    amrap: true,
    pct: 0.95,
  },
  {
    id: 'deadlift',
    label: 'Deadlift',
    trainingMax: 405,
    topWeight: 385,
    topReps: 1,
    amrap: true,
    pct: 0.95,
  },
  {
    id: 'press',
    label: 'Press',
    trainingMax: 145,
    topWeight: 140,
    topReps: 1,
    amrap: true,
    pct: 0.95,
  },
];

const meta: Meta<HomeScreenProps> = {
  title: 'Features/Home/HomeScreen',
  component: HomeScreen,
};
export default meta;

export const freshStart: Story = {
  args: {
    greeting: 'Good morning',
    cycleStatus: { kind: 'freshStart' },
    lifts: freshStartLifts,
    unit: 'lbs',
    completedSessions: 0,
  },
};

export const midCycle: Story = {
  args: {
    greeting: 'Good afternoon',
    cycleStatus: { kind: 'active', cycle: 3, week: 2 },
    lifts: midCycleLifts,
    unit: 'lbs',
    completedSessions: 8,
  },
};

export const benchOnly: Story = {
  args: {
    greeting: 'Good evening',
    cycleStatus: { kind: 'active', cycle: 4, week: 2 },
    lifts: [
      {
        id: 'bench',
        label: 'Bench',
        trainingMax: 215,
        topWeight: 195,
        topReps: 3,
        amrap: true,
        pct: 0.9,
      },
    ],
    unit: 'lbs',
    completedSessions: 1,
  },
};

export const advanced: Story = {
  args: {
    greeting: 'Good morning',
    cycleStatus: { kind: 'justAdvanced', fromCycle: 5, toCycle: 6 },
    lifts: advancedLifts,
    unit: 'lbs',
    completedSessions: 13,
    recentNotice: {
      title: '+10 deadlift training max',
      subline: 'cycle 5 cleared — keep going.',
    },
  },
};
