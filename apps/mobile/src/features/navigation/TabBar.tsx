import { Icon, type IconName } from '@/design/icons';
import { Text } from '@/design/primitives/Text';
import { colors, shape } from '@/design/tokens';
/**
 * 531 Strength — bottom TabBar.
 *
 * Glassy floating pill rendered as the `tabBar` prop for expo-router's
 * `<Tabs>` layout. Active tab shows icon + label in `hot`; inactive tabs
 * show icon only in `ink2` (the muted/inactive ink token).
 *
 * Backdrop blur is provided by `expo-glass-effect`'s `GlassView` — the
 * SDK 55-blessed glass primitive. On non-iOS platforms `GlassView`
 * degrades to a plain `View`, so we layer a `bg1` tint underneath via
 * the wrapper to keep the bar legible on Android / Web.
 */
import { GlassView } from 'expo-glass-effect';
import { type GestureResponderEvent, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ── Minimal local mirror of @react-navigation/bottom-tabs' BottomTabBarProps ──
// We only consume `state.{index,routes}` + `navigation.{emit,navigate}` so we
// keep a focused local shape rather than dragging the full transitive type.
type TabRoute = {
  key: string;
  name: string;
  params?: object | undefined;
};

type TabNavigationEmitResult = { defaultPrevented: boolean };

type TabNavigation = {
  emit: (event: {
    type: 'tabPress';
    target: string;
    canPreventDefault: true;
  }) => TabNavigationEmitResult;
  navigate: (name: string, params?: object) => void;
};

export type TabBarProps = {
  state: { index: number; routes: TabRoute[] };
  navigation: TabNavigation;
};

const TAB_ICONS: Record<string, IconName> = {
  home: 'home',
  library: 'list',
  cycle: 'calendar',
  history: 'history',
  settings: 'settings',
};

const TAB_LABELS: Record<string, string> = {
  home: 'Home',
  library: 'Library',
  cycle: 'Cycle',
  history: 'History',
  settings: 'Settings',
};

export function TabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: shape.rMd,
        right: shape.rMd,
        bottom: insets.bottom + shape.rMd,
      }}
    >
      <GlassView
        glassEffectStyle="regular"
        colorScheme="dark"
        style={{
          flexDirection: 'row',
          borderRadius: shape.rPill,
          padding: shape.rXs,
          overflow: 'hidden',
          backgroundColor: colors.bg1,
        }}
      >
        {state.routes.map((route, index) => {
          const active = state.index === index;
          const iconName = TAB_ICONS[route.name] ?? 'circle';
          const label = TAB_LABELS[route.name] ?? route.name;
          const onPress = (_event: GestureResponderEvent) => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!active && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };
          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={label}
              onPress={onPress}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: shape.rXs,
                paddingVertical: shape.rSm,
                paddingHorizontal: shape.rSm,
                borderRadius: shape.rPill,
                backgroundColor: active ? colors.bg2 : 'transparent',
              }}
            >
              <Icon name={iconName} size={20} color={active ? colors.hot : colors.ink2} />
              {active ? (
                <Text variant="smallBold" tone="hot">
                  {label}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </GlassView>
    </View>
  );
}

export default TabBar;
