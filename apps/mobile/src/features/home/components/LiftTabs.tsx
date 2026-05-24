/**
 * Caps-style row of enabled lift names. Active label is full-ink and gets an
 * ink underline; idle labels render in tertiary ink. The lift currently
 * mid-session displays a 5×5 ink square next to its name (in-progress dot).
 * Lifts that have ever set a PR get a small ★ glyph after their name —
 * always-on visual reinforcement of the user's records.
 *
 * Ported from `~/Development/531-pwa/src/features/home/components/LiftTabs.tsx`.
 * SegRail isn't used because it doesn't support per-option suffix slots
 * (needed for the dot + star affordances).
 */
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import { liftDisplayName } from '@/domain/labels';
import type { Lift } from '@/domain/types';
import * as Haptics from 'expo-haptics';
import { Pressable, Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

type LiftTabsProps = {
  enabled: readonly Lift[];
  selected: Lift;
  inProgressLift: Lift | null;
  /** Lifts that have ever recorded a PR. Renders a small ★ after the label. */
  prLifts?: ReadonlySet<Lift>;
  onSelect: (lift: Lift) => void;
};

/** Short label used in the tab row (`Dead` for deadlift, otherwise full name). */
function shortName(lift: Lift): string {
  return lift === 'deadlift' ? 'Dead' : liftDisplayName(lift);
}

export function LiftTabs({ enabled, selected, inProgressLift, prLifts, onSelect }: LiftTabsProps) {
  const { colors, spacing, type } = useTheme();

  const wrapperStyle: ViewStyle = {
    backgroundColor: colors.bg0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg + spacing.xs, // 20 = 16 + 4
  };

  return (
    <Row
      justify="center"
      style={[wrapperStyle, { gap: spacing.xl + spacing.xs }]}
      testID="lift-tabs"
    >
      {enabled.map((lift) => {
        const active = lift === selected;
        const inProg = lift === inProgressLift;
        const hasPr = prLifts?.has(lift) ?? false;

        const buttonStyle: ViewStyle = {
          paddingVertical: spacing.xs + 2,
          flexDirection: 'column',
          alignItems: 'center',
          gap: spacing.xs + 2,
          minHeight: 44,
        };

        const labelStyle: TextStyle = {
          fontFamily: type.mono,
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.22 * 11,
          textTransform: 'uppercase',
          color: active ? colors.ink0 : colors.ink3,
        };

        const starStyle: TextStyle = {
          fontFamily: `${type.mono}-Bold`,
          fontSize: 9,
          color: active ? colors.ink0 : colors.ink2,
        };

        const dotStyle: ViewStyle = {
          width: 5,
          height: 5,
          backgroundColor: colors.ink0,
        };

        const underlineStyle: ViewStyle = {
          height: 2,
          width: 20,
          backgroundColor: active ? colors.ink0 : 'transparent',
        };

        const handlePress = () => {
          if (!active) Haptics.selectionAsync();
          onSelect(lift);
        };

        const a11yLabel = [
          liftDisplayName(lift),
          inProg ? 'session in progress' : null,
          hasPr ? 'personal record' : null,
        ]
          .filter(Boolean)
          .join(', ');

        return (
          <Pressable
            key={lift}
            onPress={handlePress}
            testID={`lift-tab-${lift}`}
            accessibilityRole="button"
            accessibilityLabel={a11yLabel}
            accessibilityState={{ selected: active }}
            style={buttonStyle}
          >
            <Row gap="xs" style={{ gap: spacing.xs + 2 }}>
              <RNText style={labelStyle}>{shortName(lift)}</RNText>
              {hasPr ? (
                <Animated.Text
                  style={starStyle}
                  testID={`lift-tab-${lift}-pr-star`}
                  entering={FadeIn.duration(280)}
                >
                  ★
                </Animated.Text>
              ) : null}
              {inProg ? <View style={dotStyle} testID={`lift-tab-${lift}-progress-dot`} /> : null}
            </Row>
            <View style={underlineStyle} />
          </Pressable>
        );
      })}
    </Row>
  );
}
