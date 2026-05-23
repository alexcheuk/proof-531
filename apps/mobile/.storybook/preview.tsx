import type { ReactElement } from 'react';
import { View } from 'react-native';
import { ThemeProvider } from '../src/design/theme';
import { colors, shape } from '../src/design/tokens';

// Local Preview shape — @storybook/react-native v8 re-exports `Preview` from
// `@storybook/react`, which is not directly resolvable in this workspace.
type Preview = {
  decorators?: Array<(Story: () => ReactElement) => ReactElement>;
  parameters?: Record<string, unknown>;
};

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.bg0,
            padding: shape.rLg,
            justifyContent: 'center',
          }}
        >
          <Story />
        </View>
      </ThemeProvider>
    ),
  ],
  parameters: {},
};

export default preview;
