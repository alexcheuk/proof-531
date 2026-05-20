import type { ReactElement } from 'react';
import { CycleScreen, type CycleScreenProps } from '../CycleScreen';

// Local Meta/StoryObj helpers — mirrors HomeScreen.stories pattern. See its
// header for the rationale (no re-export from @storybook/react-native v8).
type Meta<P> = {
  title: string;
  component: (props: P) => ReactElement;
};
type Story = {
  args?: Partial<CycleScreenProps>;
  render?: () => ReactElement;
};

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

const meta: Meta<CycleScreenProps> = {
  title: 'Features/Cycle/CycleScreen',
  component: CycleScreen,
};
export default meta;

export const freshStart: Story = {
  args: {
    cycleNumber: 1,
    weekOfCycle: 1,
    lifts: freshStartLifts,
    completedSessions: [],
    unit: 'lbs',
  },
};

export const midCycle: Story = {
  args: {
    cycleNumber: 3,
    weekOfCycle: 2,
    lifts: midCycleLifts,
    completedSessions: [
      { week: 1, liftId: 'squat' },
      { week: 1, liftId: 'bench' },
      { week: 1, liftId: 'deadlift' },
      { week: 2, liftId: 'squat' },
      { week: 2, liftId: 'bench' },
    ],
    unit: 'lbs',
  },
};

export const benchOnly: Story = {
  args: {
    cycleNumber: 4,
    weekOfCycle: 2,
    lifts: [{ id: 'bench', label: 'Bench', trainingMax: 215 }],
    completedSessions: [{ week: 1, liftId: 'bench' }],
    unit: 'lbs',
  },
};
