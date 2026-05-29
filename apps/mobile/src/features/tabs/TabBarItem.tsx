import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import * as Haptics from 'expo-haptics';
import { Pressable, View, type ViewStyle } from 'react-native';

const LABELS: Record<string, string> = {
  index: 'TODAY',
  progress: 'PROGRESS',
  history: 'HISTORY',
  settings: 'YOU',
};

type TabBarRoute = { key: string; name: string };

type TabBarNavigation = {
  emit: (event: {
    type: 'tabPress';
    target: string;
    canPreventDefault: true;
  }) => { defaultPrevented: boolean };
  navigate: (routeName: string) => void;
};

export type TabBarItemProps = {
  route: TabBarRoute;
  focused: boolean;
  showDot: boolean;
  navigation: TabBarNavigation;
};

export function TabBarItem({ route, focused, showDot, navigation }: TabBarItemProps) {
  const { colors, spacing } = useTheme();
  const label = LABELS[route.name] ?? route.name.toUpperCase();

  const onPress = () => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (!focused && !event.defaultPrevented) {
      void Haptics.selectionAsync();
      navigation.navigate(route.name);
    }
  };

  const pressableStyle: ViewStyle = {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    minWidth: 60,
    gap: spacing.xs,
  };

  const dotStyle: ViewStyle = {
    width: 5,
    height: 5,
    backgroundColor: colors.ink0,
  };

  const underlineStyle: ViewStyle = {
    width: 16,
    height: 1,
    backgroundColor: focused ? colors.ink0 : 'transparent',
  };

  return (
    <Pressable
      testID={`tab-${route.name}`}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={showDot ? `${label}, session in progress` : label}
      accessibilityHint={focused ? undefined : `Switches to the ${label.toLowerCase()} tab`}
      hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
      onPress={onPress}
      style={pressableStyle}
    >
      <Row gap="xs">
        <CapsLabel weight={focused ? 'bold' : 'medium'} color={focused ? 'ink0' : 'ink3'}>
          {label}
        </CapsLabel>
        {showDot ? <View style={dotStyle} testID="tab-index-progress-dot" /> : null}
      </Row>
      <View style={underlineStyle} />
    </Pressable>
  );
}
