import { render } from '@testing-library/react-native';
import type React from 'react';
import { ThemeProvider } from '../../theme';

import * as CardStories from '../__stories__/Card.stories';
import * as NumberStepperStories from '../__stories__/NumberStepper.stories';
import * as PressButtonStories from '../__stories__/PressButton.stories';
import * as SegRailStories from '../__stories__/SegRail.stories';
import * as WeightNumStories from '../__stories__/WeightNum.stories';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

type StoryModule = Record<string, unknown> & {
  default: { component?: React.ComponentType<unknown> };
};

type Story = {
  render?: () => React.ReactElement;
  args?: Record<string, unknown>;
};

const modules: Record<string, StoryModule> = {
  PressButton: PressButtonStories as unknown as StoryModule,
  Card: CardStories as unknown as StoryModule,
  SegRail: SegRailStories as unknown as StoryModule,
  NumberStepper: NumberStepperStories as unknown as StoryModule,
  WeightNum: WeightNumStories as unknown as StoryModule,
};

describe('storybook: every primitive story renders without warning', () => {
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  for (const [groupName, mod] of Object.entries(modules)) {
    const Component = mod.default.component as React.ComponentType<unknown> | undefined;
    const storyNames = Object.keys(mod).filter((k) => k !== 'default');

    for (const name of storyNames) {
      it(`${groupName} > ${name}`, () => {
        const story = mod[name] as Story;
        let StoryHost: React.ComponentType;
        if (story.render) {
          const Render = story.render;
          StoryHost = () => Render();
        } else if (Component) {
          const args = story.args ?? {};
          StoryHost = () => <Component {...args} />;
        } else {
          throw new Error(`${groupName}.${name}: no render and no component`);
        }
        const { unmount } = render(
          <ThemeProvider>
            <StoryHost />
          </ThemeProvider>,
        );
        expect(warnSpy).not.toHaveBeenCalled();
        expect(errorSpy).not.toHaveBeenCalled();
        unmount();
      });
    }
  }
});
