import type { ComponentType } from 'react';

let StorybookUIRoot: ComponentType | null = null;
if (__DEV__) {
  StorybookUIRoot = require('../../.storybook').default as ComponentType;
}

export default function StorybookRoute() {
  if (!__DEV__ || StorybookUIRoot === null) {
    return null;
  }
  return <StorybookUIRoot />;
}
