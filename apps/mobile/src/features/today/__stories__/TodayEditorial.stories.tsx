import type { ReactElement } from 'react';
import { TodayEditorial, type TodayEditorialProps } from '../TodayEditorial';
import type { TodaySession } from '../today-types';

// Local Meta/StoryObj helpers — mirrors HomeScreen.stories.tsx pattern.
type Meta<P> = {
  title: string;
  component: (props: P) => ReactElement;
};
type Story = {
  args?: Partial<TodayEditorialProps>;
  render?: () => ReactElement;
};

const week1: TodaySession = {
  cycleNumber: 3,
  liftId: 'squat',
  liftLabel: 'Squat',
  trainingMax: 300,
  unit: 'lbs',
  weekOfCycle: 1,
  sets: [],
};

const week3: TodaySession = {
  cycleNumber: 3,
  liftId: 'deadlift',
  liftLabel: 'Deadlift',
  trainingMax: 345,
  unit: 'lbs',
  weekOfCycle: 3,
  sets: [],
};

const deload: TodaySession = {
  cycleNumber: 3,
  liftId: 'bench',
  liftLabel: 'Bench',
  trainingMax: 200,
  unit: 'lbs',
  weekOfCycle: 4,
  sets: [],
};

const meta: Meta<TodayEditorialProps> = {
  title: 'Features/Today/TodayEditorial',
  component: TodayEditorial,
};
export default meta;

export const Week1: Story = {
  args: { session: week1 },
};

export const Week3: Story = {
  args: { session: week3 },
};

export const Deload: Story = {
  args: { session: deload },
};

export const ChipsVariant: Story = {
  args: { session: week1, plateVariant: 'chips' },
};

export const NumericalVariant: Story = {
  args: { session: week1, plateVariant: 'numerical' },
};
