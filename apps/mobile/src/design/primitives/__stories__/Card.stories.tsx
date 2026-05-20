import type { ReactElement } from 'react';
import { Card, type CardProps } from '../Card';
import { Text } from '../Text';

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

const meta: Meta<CardProps> = { title: 'Primitives/Card', component: Card };
export default meta;

type Story = StoryObj<CardProps>;

export const Padded: Story = { args: { padded: true, children: <Text>Padded card</Text> } };
export const Unpadded: Story = {
  args: { padded: false, children: <Text>No internal padding</Text> },
};
export const Interactive: Story = {
  args: { padded: true, interactive: true, onPress: () => {}, children: <Text>Tap me</Text> },
};
export const Nested: Story = {
  args: {
    padded: true,
    children: (
      <>
        <Text variant="subtitle">Title</Text>
        <Text variant="small" tone="ink2">
          Secondary line
        </Text>
      </>
    ),
  },
};
