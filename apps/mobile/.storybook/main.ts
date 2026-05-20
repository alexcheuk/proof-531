import type { StorybookConfig } from '@storybook/react-native';

const main: StorybookConfig = {
  stories: ['../src/design/**/__stories__/*.stories.@(ts|tsx)'],
  addons: [],
};

export default main;
