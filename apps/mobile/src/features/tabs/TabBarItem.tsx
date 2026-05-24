import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import * as Haptics from 'expo-haptics';
import { Pressable, Text as RNText, View, type ViewStyle } from 'react-native';

const LABELS: Record<string, string> = {
  index: 'TODAY',
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

/**
 * One tab in the custom bottom bar — label + optional in-progress dot +
 * focused underline. Fires a selection haptic on navigation, suppressed
 * when re-pressing the active tab.
 */
export function TabBarItem({ route, focused, showDot, navigation }: TabBarItemProps) {
  const { colors, spacing, type } = useTheme();
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
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={showDot ? `${label}, session in progress` : label}
      onPress={onPress}
      style={pressableStyle}
    >
      <Row gap="xs">
        <RNText
          style={{
            fontFamily: focused ? `${type.mono}-Bold` : `${type.mono}-Medium`,
            fontSize: 10,
            letterSpacing: 2.2,
            color: focused ? colors.ink0 : colors.ink3,
          }}
        >
          {label}
        </RNText>
        {showDot ? <View style={dotStyle} testID="tab-index-progress-dot" /> : null}
      </Row>
      <View style={underlineStyle} />
    </Pressable>
  );
}
