import type { ReactElement } from 'react';
import { PressButton, type PressButtonProps } from '../PressButton';

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

const meta: Meta<PressButtonProps> = {
  title: 'Primitives/PressButton',
  component: PressButton,
  args: { onPress: () => {} },
};
export default meta;

type Story = StoryObj<PressButtonProps>;

export const EmberSm: Story = { args: { variant: 'ember', size: 'sm', children: 'Ember sm' } };
export const EmberMd: Story = { args: { variant: 'ember', size: 'md', children: 'Ember md' } };
export const EmberLg: Story = { args: { variant: 'ember', size: 'lg', children: 'Ember lg' } };
export const InverseSm: Story = {
  args: { variant: 'inverse', size: 'sm', children: 'Inverse sm' },
};
export const InverseMd: Story = {
  args: { variant: 'inverse', size: 'md', children: 'Inverse md' },
};
export const InverseLg: Story = {
  args: { variant: 'inverse', size: 'lg', children: 'Inverse lg' },
};
export const GhostSm: Story = { args: { variant: 'ghost', size: 'sm', children: 'Ghost sm' } };
export const GhostMd: Story = { args: { variant: 'ghost', size: 'md', children: 'Ghost md' } };
export const GhostLg: Story = { args: { variant: 'ghost', size: 'lg', children: 'Ghost lg' } };
