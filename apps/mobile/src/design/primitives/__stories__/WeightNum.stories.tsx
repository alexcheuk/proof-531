import type { ReactElement } from 'react';
import { WeightNum, type WeightNumProps } from '../WeightNum';

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

const meta: Meta<WeightNumProps> = { title: 'Primitives/WeightNum', component: WeightNum };
export default meta;

type Story = StoryObj<WeightNumProps>;

export const Sm: Story = { args: { value: 225, size: 'sm' } };
export const Md: Story = { args: { value: 225, size: 'md' } };
export const Lg: Story = { args: { value: 225, size: 'lg' } };
