import type { ReactElement } from 'react';
import { Numerical, type NumericalProps } from '../Numerical';

// Local Meta/StoryObj helpers — @storybook/react-native v8 does not re-export
// these from @storybook/react, so we define minimal CSF-3 shapes here.
type Meta<P> = {
  title: string;
  component: (props: P) => ReactElement;
  args?: Partial<P>;
};
type StoryObj<P> = {
  args?: Partial<P>;
  render?: () => ReactElement;
};

const meta: Meta<NumericalProps> = { title: 'Plates/Numerical', component: Numerical };
export default meta;

type Story = StoryObj<NumericalProps>;

export const W135: Story = { args: { weight: 135 } };
export const W225: Story = { args: { weight: 225 } };
export const W315: Story = { args: { weight: 315 } };
export const W405: Story = { args: { weight: 405 } };
export const W495: Story = { args: { weight: 495 } };
