import type { ReactElement } from 'react';
import { SettingsScreen, type SettingsScreenProps } from '../SettingsScreen';

// Local Meta/StoryObj helpers — @storybook/react-native v8 does not re-export
// these from @storybook/react, so we define minimal CSF-3 shapes here.
type Meta<P> = {
  title: string;
  component: (props: P) => ReactElement;
};
type Story = {
  args?: Partial<SettingsScreenProps>;
  render?: () => ReactElement;
};

const noop = () => {};

const meta: Meta<SettingsScreenProps> = {
  title: 'Features/Settings/SettingsScreen',
  component: SettingsScreen,
};
export default meta;

export const defaultStory: Story = {
  args: {
    unit: 'lbs',
    onUnitChange: noop,
    plateSet: 'standard-lbs',
    onPlateSetChange: noop,
    lifts: [
      { id: 'squat', label: 'Squat', enabled: true },
      { id: 'bench', label: 'Bench', enabled: true },
      { id: 'deadlift', label: 'Deadlift', enabled: true },
      { id: 'press', label: 'Press', enabled: true },
    ],
    onToggleLift: noop,
    analyticsEnabled: true,
    onAnalyticsChange: noop,
  },
};

export const minimal: Story = {
  args: {
    unit: 'kg',
    onUnitChange: noop,
    plateSet: 'standard-kg',
    onPlateSetChange: noop,
    lifts: [
      { id: 'squat', label: 'Squat', enabled: true },
      { id: 'bench', label: 'Bench', enabled: false },
      { id: 'deadlift', label: 'Deadlift', enabled: false },
      { id: 'press', label: 'Press', enabled: false },
    ],
    onToggleLift: noop,
    analyticsEnabled: false,
    onAnalyticsChange: noop,
  },
};
