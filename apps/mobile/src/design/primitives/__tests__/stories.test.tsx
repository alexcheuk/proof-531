import { render } from '@testing-library/react-native';
import type React from 'react';
import { ThemeProvider } from '../../theme';

import * as CycleScreenStories from '@/features/cycle/__stories__/CycleScreen.stories';
import * as HistoryScreenStories from '@/features/history/__stories__/HistoryScreen.stories';
import * as HomeScreenStories from '@/features/home/__stories__/HomeScreen.stories';
import * as LibraryScreenStories from '@/features/library/__stories__/LibraryScreen.stories';
import * as LiveScreenStories from '@/features/live/__stories__/LiveScreen.stories';
import * as PRModalStories from '@/features/pr/__stories__/PRModal.stories';
import * as SettingsScreenStories from '@/features/settings/__stories__/SettingsScreen.stories';
import * as TodayCardsStories from '@/features/today/__stories__/TodayCards.stories';
import * as TodayDataStories from '@/features/today/__stories__/TodayData.stories';
import * as TodayEditorialStories from '@/features/today/__stories__/TodayEditorial.stories';
import * as BarbellStories from '../../plates/__stories__/Barbell.stories';
import * as ChipsStories from '../../plates/__stories__/Chips.stories';
import * as NumericalStories from '../../plates/__stories__/Numerical.stories';
import * as CardStories from '../__stories__/Card.stories';
import * as NumberStepperStories from '../__stories__/NumberStepper.stories';
import * as PressButtonStories from '../__stories__/PressButton.stories';
import * as SegRailStories from '../__stories__/SegRail.stories';
import * as WeightNumStories from '../__stories__/WeightNum.stories';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  notificationAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const passthrough = ({ children }: { children?: unknown }) =>
    React.createElement(React.Fragment, null, children);
  return {
    Canvas: passthrough,
    Group: passthrough,
    Rect: passthrough,
    RoundedRect: () => null,
    Path: () => null,
    LinearGradient: () => null,
    vec: (x: number, y: number) => ({ x, y }),
    Skia: { Path: { Make: () => ({ addCircle() {}, addArc() {} }) } },
  };
});

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
  Barbell: BarbellStories as unknown as StoryModule,
  Chips: ChipsStories as unknown as StoryModule,
  Numerical: NumericalStories as unknown as StoryModule,
  HomeScreen: HomeScreenStories as unknown as StoryModule,
  CycleScreen: CycleScreenStories as unknown as StoryModule,
  HistoryScreen: HistoryScreenStories as unknown as StoryModule,
  LibraryScreen: LibraryScreenStories as unknown as StoryModule,
  LiveScreen: LiveScreenStories as unknown as StoryModule,
  PRModal: PRModalStories as unknown as StoryModule,
  SettingsScreen: SettingsScreenStories as unknown as StoryModule,
  TodayCards: TodayCardsStories as unknown as StoryModule,
  TodayData: TodayDataStories as unknown as StoryModule,
  TodayEditorial: TodayEditorialStories as unknown as StoryModule,
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
