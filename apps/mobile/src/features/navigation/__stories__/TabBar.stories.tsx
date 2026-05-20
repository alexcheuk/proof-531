import { colors } from '@/design/tokens';
import type { ReactElement } from 'react';
import { View } from 'react-native';
import { TabBar, type TabBarProps } from '../TabBar';

// Local Meta/StoryObj helpers — @storybook/react-native v8 does not re-export
// these from @storybook/react, so we define minimal CSF-3 shapes here (same
// pattern as src/design/primitives/__stories__/*).
type Meta<P> = {
  title: string;
  component: (props: P) => ReactElement;
};
type StoryObj = {
  render: () => ReactElement;
};

const ROUTE_NAMES = ['home', 'library', 'cycle', 'history', 'settings'] as const;

const makeProps = (active: number): TabBarProps => ({
  state: {
    index: active,
    routes: ROUTE_NAMES.map((name, i) => ({ key: `${name}-${i}`, name, params: undefined })),
  },
  navigation: {
    emit: () => ({ defaultPrevented: false }),
    navigate: () => {},
  },
});

// Mount the bar inside a fixed-height dark stage so the floating pill has
// somewhere to rest above the bottom edge.
const Stage = ({ children }: { children: ReactElement }) => (
  <View style={{ height: 140, backgroundColor: colors.bg0, justifyContent: 'flex-end' }}>
    {children}
  </View>
);

const meta: Meta<Record<string, never>> = {
  title: 'Features/Navigation/TabBar',
  component: () => <Stage>{<TabBar {...makeProps(0)} />}</Stage>,
};
export default meta;

export const HomeActive: StoryObj = {
  render: () => <Stage>{<TabBar {...makeProps(0)} />}</Stage>,
};
export const LibraryActive: StoryObj = {
  render: () => <Stage>{<TabBar {...makeProps(1)} />}</Stage>,
};
export const CycleActive: StoryObj = {
  render: () => <Stage>{<TabBar {...makeProps(2)} />}</Stage>,
};
export const HistoryActive: StoryObj = {
  render: () => <Stage>{<TabBar {...makeProps(3)} />}</Stage>,
};
export const SettingsActive: StoryObj = {
  render: () => <Stage>{<TabBar {...makeProps(4)} />}</Stage>,
};
