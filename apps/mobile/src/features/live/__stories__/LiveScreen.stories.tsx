import type { ReactElement } from 'react';
import { LiveScreen, type LiveScreenProps, type TodaySession } from '../LiveScreen';
import { RestPhase } from '../RestPhase';

// Local CSF-3 helpers — matches the pattern used by the other feature
// stories (see HomeScreen.stories.tsx) because @storybook/react-native v8
// does not re-export Meta/StoryObj. We accept `ReactElement | null` to
// accommodate components that early-return null.
type Meta<P> = {
  title: string;
  component: (props: P) => ReactElement | null;
};
type Story = {
  args?: Partial<LiveScreenProps>;
  render?: () => ReactElement;
};

const liftingMainSession: TodaySession = {
  liftId: 'squat',
  liftLabel: 'Squat',
  unit: 'lbs',
  sets: [
    { index: 0, type: 'main', prescribedWeight: 195, prescribedReps: 5, amrap: false },
    { index: 1, type: 'main', prescribedWeight: 225, prescribedReps: 3, amrap: false },
    { index: 2, type: 'main', prescribedWeight: 250, prescribedReps: 1, amrap: true },
  ],
};

const amrapSession: TodaySession = {
  liftId: 'bench',
  liftLabel: 'Bench',
  unit: 'lbs',
  sets: [{ index: 0, type: 'main', prescribedWeight: 200, prescribedReps: 5, amrap: true }],
};

const restNextSession: TodaySession = liftingMainSession;

const noop = () => {};

const meta: Meta<LiveScreenProps> = {
  title: 'Features/Live/LiveScreen',
  component: LiveScreen,
};
export default meta;

export const liftingMain: Story = {
  args: {
    session: liftingMainSession,
    setIndex: 0,
    onComplete: noop,
    onClose: noop,
  },
};

export const liftingAMRAP: Story = {
  args: {
    session: amrapSession,
    setIndex: 0,
    history: [],
    onComplete: noop,
    onClose: noop,
    onPRDetected: noop,
  },
};

// RestPhase is rendered directly so the visual fixture doesn't require the
// LiftingPhase -> "Complete" press to transition.
export const restWithNext: Story = {
  render: () => (
    <RestPhase
      targetSeconds={180}
      nextSet={restNextSession.sets[1]}
      unit="lbs"
      elapsed={45}
      onNext={noop}
    />
  ),
};
