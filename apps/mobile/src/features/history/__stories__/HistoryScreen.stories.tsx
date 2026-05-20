import type { ReactElement } from 'react';
import { HistoryScreen, type HistoryScreenProps } from '../HistoryScreen';
import type { HistorySession } from '../HistorySessionRow';

// Local Meta/StoryObj helpers — mirrors HomeScreen.stories pattern. See its
// header for the rationale (no re-export from @storybook/react-native v8).
type Meta<P> = {
  title: string;
  component: (props: P) => ReactElement;
};
type Story = {
  args?: Partial<HistoryScreenProps>;
  render?: () => ReactElement;
};

const fourLifts = [
  { id: 'squat', label: 'Squat' },
  { id: 'bench', label: 'Bench' },
  { id: 'deadlift', label: 'Deadlift' },
  { id: 'press', label: 'Press' },
];

const benchOnly = [{ id: 'bench', label: 'Bench' }];

const multiLiftHistory: HistorySession[] = [
  {
    id: 1,
    completedAt: new Date('2026-05-14T12:00:00Z'),
    liftId: 'squat',
    liftLabel: 'Squat',
    week: 3,
    cycleNumber: 2,
    topWeight: 315,
    topReps: 5,
    amrap: true,
    e1rm: 367,
    isPR: false,
  },
  {
    id: 2,
    completedAt: new Date('2026-05-12T12:00:00Z'),
    liftId: 'bench',
    liftLabel: 'Bench',
    week: 3,
    cycleNumber: 2,
    topWeight: 225,
    topReps: 6,
    amrap: true,
    e1rm: 270,
    isPR: false,
  },
  {
    id: 3,
    completedAt: new Date('2026-05-09T12:00:00Z'),
    liftId: 'deadlift',
    liftLabel: 'Deadlift',
    week: 2,
    cycleNumber: 2,
    topWeight: 405,
    topReps: 3,
    amrap: false,
    e1rm: 442,
    isPR: false,
  },
  {
    id: 4,
    completedAt: new Date('2026-05-07T12:00:00Z'),
    liftId: 'press',
    liftLabel: 'Press',
    week: 2,
    cycleNumber: 2,
    topWeight: 135,
    topReps: 8,
    amrap: true,
    e1rm: 171,
    isPR: false,
  },
];

const singleLiftHistory: HistorySession[] = [
  {
    id: 11,
    completedAt: new Date('2026-05-12T12:00:00Z'),
    liftId: 'bench',
    liftLabel: 'Bench',
    week: 3,
    cycleNumber: 4,
    topWeight: 235,
    topReps: 5,
    amrap: true,
    e1rm: 274,
    isPR: false,
  },
];

const prHistory: HistorySession[] = multiLiftHistory.map((s, i) => ({
  ...s,
  isPR: i % 2 === 0,
}));

const meta: Meta<HistoryScreenProps> = {
  title: 'Features/History/HistoryScreen',
  component: HistoryScreen,
};
export default meta;

export const empty: Story = {
  args: {
    history: [],
    unit: 'lbs',
    enabledLifts: fourLifts,
  },
};

export const singleLift: Story = {
  args: {
    history: singleLiftHistory,
    unit: 'lbs',
    enabledLifts: benchOnly,
  },
};

export const multiLift: Story = {
  args: {
    history: multiLiftHistory,
    unit: 'lbs',
    enabledLifts: fourLifts,
  },
};

export const withPRs: Story = {
  args: {
    history: prHistory,
    unit: 'lbs',
    enabledLifts: fourLifts,
  },
};
