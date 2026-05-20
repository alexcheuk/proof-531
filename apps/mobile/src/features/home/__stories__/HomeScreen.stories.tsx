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
//
// Per-stage summary (see seed.ts header):
//   freshStart: TMs {squat:235, bench:175, deadlift:305, press:115}, fresh
//   midCycle:   TMs {squat:275, bench:195, deadlift:345}, press disabled,
//               cycle 3 week 2 active, 8 sessions done
//   benchOnly:  bench only (TM 215), cycle 4 week 2, 1 session done
//   advanced:   TMs {squat:320, bench:220, deadlift:405, press:145},
//               cycle 6 week 3 active, 13 sessions done

const freshStartLifts = [
  { id: 'squat', label: 'Squat', trainingMax: 235 },
  { id: 'bench', label: 'Bench', trainingMax: 175 },
  { id: 'deadlift', label: 'Deadlift', trainingMax: 305 },
  { id: 'press', label: 'Press', trainingMax: 115 },
];

const midCycleLifts = [
  { id: 'squat', label: 'Squat', trainingMax: 275 },
  { id: 'bench', label: 'Bench', trainingMax: 195 },
  { id: 'deadlift', label: 'Deadlift', trainingMax: 345 },
];

const advancedLifts = [
  { id: 'squat', label: 'Squat', trainingMax: 320 },
  { id: 'bench', label: 'Bench', trainingMax: 220 },
  { id: 'deadlift', label: 'Deadlift', trainingMax: 405 },
  { id: 'press', label: 'Press', trainingMax: 145 },
];

const meta: Meta<HomeScreenProps> = {
  title: 'Features/Home/HomeScreen',
  component: HomeScreen,
};
export default meta;

export const freshStart: Story = {
  args: {
    greeting: 'Good morning',
    headline: 'Welcome.',
    cycleStatus: { kind: 'freshStart' },
    lifts: freshStartLifts,
    stats: { prs: 0, sessions: 0, daysLifted: 0 },
  },
};

export const midCycle: Story = {
  args: {
    greeting: 'Good afternoon',
    headline: 'Time to lift.',
    cycleStatus: { kind: 'active', cycle: 3, week: 2 },
    lifts: midCycleLifts,
    stats: { prs: 2, sessions: 8, daysLifted: 22 },
  },
};

export const benchOnly: Story = {
  args: {
    greeting: 'Good evening',
    headline: 'Single focus.',
    cycleStatus: { kind: 'active', cycle: 4, week: 2 },
    lifts: [{ id: 'bench', label: 'Bench', trainingMax: 215 }],
    stats: { prs: 1, sessions: 1, daysLifted: 1 },
  },
};

export const advanced: Story = {
  args: {
    greeting: 'Good morning',
    headline: 'Strong cycle.',
    cycleStatus: { kind: 'justAdvanced', fromCycle: 5, toCycle: 6 },
    lifts: advancedLifts,
    stats: { prs: 5, sessions: 13, daysLifted: 42 },
  },
};
