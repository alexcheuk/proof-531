import type { ReactElement } from 'react';
import { TodayCards, type TodayCardsProps } from '../TodayCards';
import type { TodaySession } from '../today-types';

// Local Meta/StoryObj helpers — mirrors HomeScreen.stories.tsx pattern.
type Meta<P> = {
  title: string;
  component: (props: P) => ReactElement;
};
type Story = {
  args?: Partial<TodayCardsProps>;
  render?: () => ReactElement;
};

const week1: TodaySession = {
  liftId: 'squat',
  liftLabel: 'Squat',
  unit: 'lbs',
  weekOfCycle: 1,
  sets: [
    { index: 0, type: 'main', weight: 195, reps: 5, amrap: false, pct: 0.65 },
    { index: 1, type: 'main', weight: 225, reps: 5, amrap: false, pct: 0.75 },
    { index: 2, type: 'main', weight: 250, reps: 5, amrap: true, pct: 0.85 },
  ],
};

const week3Heavy: TodaySession = {
  liftId: 'deadlift',
  liftLabel: 'Deadlift',
  unit: 'lbs',
  weekOfCycle: 3,
  sets: [
    { index: 0, type: 'main', weight: 260, reps: 5, amrap: false, pct: 0.75, done: true },
    { index: 1, type: 'main', weight: 290, reps: 3, amrap: false, pct: 0.85, done: false },
    { index: 2, type: 'main', weight: 325, reps: 1, amrap: true, pct: 0.95, done: false },
  ],
};

const allDone: TodaySession = {
  liftId: 'bench',
  liftLabel: 'Bench',
  unit: 'lbs',
  weekOfCycle: 2,
  sets: [
    { index: 0, type: 'main', weight: 140, reps: 3, amrap: false, pct: 0.7, done: true },
    { index: 1, type: 'main', weight: 160, reps: 3, amrap: false, pct: 0.8, done: true },
    { index: 2, type: 'main', weight: 180, reps: 3, amrap: true, pct: 0.9, done: true },
  ],
};

const meta: Meta<TodayCardsProps> = {
  title: 'Features/Today/TodayCards',
  component: TodayCards,
};
export default meta;

export const Week1: Story = {
  args: { session: week1 },
};

export const Week3Heavy: Story = {
  args: { session: week3Heavy },
};

export const AllDone: Story = {
  args: { session: allDone },
};
