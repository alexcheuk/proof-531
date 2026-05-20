import type { ReactElement } from 'react';
import { PRModal, type PRModalProps } from '../PRModal';

// Local Meta/StoryObj helpers — @storybook/react-native v8 does not re-export
// these from @storybook/react, so we define minimal CSF-3 shapes here (same
// pattern as src/features/home/__stories__/HomeScreen.stories.tsx).
type Meta<P> = {
  title: string;
  component: (props: P) => ReactElement;
};
type Story = {
  args?: Partial<PRModalProps>;
  render?: () => ReactElement;
};

const meta: Meta<PRModalProps> = {
  title: 'Features/PR/PRModal',
  component: PRModal,
};
export default meta;

export const squatPR: Story = {
  args: {
    liftLabel: 'Squat',
    priorE1RM: 360,
    newE1RM: 380,
    unit: 'lbs',
    onContinue: () => {},
  },
};
