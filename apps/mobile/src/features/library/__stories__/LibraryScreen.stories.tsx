import type { ReactElement } from 'react';
import { LibraryScreen } from '../LibraryScreen';

// Local Meta/StoryObj helpers — @storybook/react-native v8 does not re-export
// these from @storybook/react, so we define minimal CSF-3 shapes here (same
// pattern as src/features/home/__stories__/HomeScreen.stories.tsx).
type Meta<P> = {
  title: string;
  component: (props: P) => ReactElement;
};
type Story = {
  args?: Record<string, never>;
  render?: () => ReactElement;
};

const meta: Meta<Record<string, never>> = {
  title: 'Features/Library/LibraryScreen',
  component: LibraryScreen,
};
export default meta;

export const defaultStory: Story = {
  args: {},
};
