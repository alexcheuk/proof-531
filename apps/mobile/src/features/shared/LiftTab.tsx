import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import { liftDisplayName } from '@/domain/labels';
import type { Lift } from '@/domain/types';
import * as Haptics from 'expo-haptics';
import { Pressable, Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const TAB_FONT_SIZE = 11;
// PWA `tracking-[0.22em]` × 11px = 2.42 letter spacing.
const TAB_LETTER_SPACING = TAB_FONT_SIZE * 0.22;

const DOT_SIZE = 5;
const UNDERLINE_WIDTH = 20;
const UNDERLINE_HEIGHT = 2;

export type LiftTabProps = {
  lift: Lift;
  active: boolean;
  inProgress: boolean;
  hasPr: boolean;
  onSelect: (lift: Lift) => void;
};

/** Short label used in the tab row (`Dead` for deadlift, otherwise full name). */
function shortName(lift: Lift): string {
  return lift === 'deadlift' ? 'Dead' : liftDisplayName(lift);
}

/**
 * One lift switch in the LiftTabs row. Caps-mono label + optional ★ PR
 * glyph + optional in-progress dot, with an ink underline when active.
 *
 * Fires a selection haptic on switch (no haptic on re-press of the
 * already-active tab).
 */
export function LiftTab({ lift, active, inProgress, hasPr, onSelect }: LiftTabProps) {
  const { colors, spacing, type } = useTheme();

  const buttonStyle: ViewStyle = {
    paddingVertical: spacing.xs + 2,
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.xs + 2,
    minHeight: 44,
  };

  const labelStyle: TextStyle = {
    fontFamily: type.mono,
    fontSize: TAB_FONT_SIZE,
    fontWeight: '600',
    letterSpacing: TAB_LETTER_SPACING,
    textTransform: 'uppercase',
    color: active ? colors.ink0 : colors.ink3,
  };

  const starStyle: TextStyle = {
    fontFamily: `${type.mono}-Bold`,
    fontSize: 9,
    color: active ? colors.ink0 : colors.ink2,
  };

  const dotStyle: ViewStyle = {
    width: DOT_SIZE,
    height: DOT_SIZE,
    backgroundColor: colors.ink0,
  };

  const underlineStyle: ViewStyle = {
    height: UNDERLINE_HEIGHT,
    width: UNDERLINE_WIDTH,
    backgroundColor: active ? colors.ink0 : 'transparent',
  };

  const handlePress = () => {
    if (!active) void Haptics.selectionAsync();
    onSelect(lift);
  };

  // Explicit fade-in for the PR star — avoids Reanimated's layout-animation
  // registry which can throw "Should not already be working" when the tab
  // bar is re-mounted (e.g. after app foreground or a navigation reset).
  const starOpacity = useSharedValue(hasPr ? 0 : 1);
  useEffect(() => {
    if (!hasPr) {
      starOpacity.value = 0;
      return;
    }
    starOpacity.value = withTiming(1, { duration: 280 });
    return () => cancelAnimation(starOpacity);
  }, [hasPr, starOpacity]);
  const starFadeStyle = useAnimatedStyle(() => ({ opacity: starOpacity.value }));

  const a11yLabel = [
    liftDisplayName(lift),
    inProgress ? 'session in progress' : null,
    hasPr ? 'personal record' : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      onPress={handlePress}
      testID={`lift-tab-${lift}`}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityState={{ selected: active }}
      style={buttonStyle}
    >
      <Row gap="xs" style={{ gap: spacing.xs + 2 }}>
        <RNText style={labelStyle}>{shortName(lift)}</RNText>
        {inProgress ? (
          // In-progress is the more actionable signal — the user is mid-session
          // and the dot is asking them to come finish. The PR star is still
          // implicit (PR carries over to the next session anyway) so hiding it
          // while a session is live is acceptable. Showing both produced a
          // visually cluttered "★ ▪" pair flagged in production review.
          <View style={dotStyle} testID={`lift-tab-${lift}-progress-dot`} />
        ) : hasPr ? (
          <Animated.Text
            style={[starStyle, starFadeStyle]}
            testID={`lift-tab-${lift}-pr-star`}
          >
            ★
          </Animated.Text>
        ) : null}
      </Row>
      <View style={underlineStyle} />
    </Pressable>
  );
}
