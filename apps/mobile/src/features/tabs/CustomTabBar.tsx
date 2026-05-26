import { useActiveSession } from '@/data/queries/useActiveSession';
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import type { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBarItem } from './TabBarItem';

type TabBarRoute = { key: string; name: string };

type TabBarNavigation = {
  emit: (event: {
    type: 'tabPress';
    target: string;
    canPreventDefault: true;
  }) => { defaultPrevented: boolean };
  navigate: (routeName: string) => void;
};

export type CustomTabBarProps = {
  state: {
    index: number;
    routes: TabBarRoute[];
  };
  // descriptors is unused but part of the expo-router/react-navigation contract
  // biome-ignore lint/suspicious/noExplicitAny: passthrough from upstream contract
  descriptors: Record<string, any>;
  navigation: TabBarNavigation;
};

export function CustomTabBar({ state, navigation }: CustomTabBarProps) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  // Surface "session in progress" on the TODAY tab from any screen.
  const activeSession = useActiveSession();
  const hasActiveSession = !!activeSession.data;

  const barStyle: ViewStyle = {
    backgroundColor: colors.bg0,
    borderTopWidth: 1,
    borderTopColor: colors.lineStrong,
    paddingTop: 14,
    paddingBottom: insets.bottom + spacing.sm,
    // `space-around` so 3 or 4 tabs lay out evenly across the bar. A
    // fixed `gap="xxxl"` (the previous setting) overflowed narrower
    // devices once Progress joined the bar in loop-024.
    paddingHorizontal: spacing.md,
  };

  return (
    <Row justify="space-around" style={barStyle}>
      {state.routes.map((route, index) => (
        <TabBarItem
          key={route.key}
          route={route}
          focused={state.index === index}
          showDot={route.name === 'index' && hasActiveSession}
          navigation={navigation}
        />
      ))}
    </Row>
  );
}
