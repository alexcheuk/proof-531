/**
 * Caps-style row of enabled lift names. Active label is full-ink and gets an
 * ink underline; idle labels render in tertiary ink. The lift currently
 * mid-session displays a 5×5 ink square next to its name (in-progress dot).
 *
 * Ported from `~/Development/531-pwa/src/features/home/components/LiftTabs.tsx`.
 * The PWA's flexbox layout (`gap-7`, `px-6`, `pt-5`) translates to native
 * tokens here. SegRail isn't used because it doesn't support per-option
 * suffix slots (needed for the dot affordance).
 *
 * Boundary: hex/px literals live in `tokens.ts`; this file consumes named
 * spacing/color tokens via `useTheme()`. The only raw px values here are
 * the typography metrics (caps mono 11/0.22em) and the 5×5 dot — both are
 * direct ports of the PWA reference and would be lost by tokenization.
 */
import { useTheme } from '@/design/theme';
import { liftDisplayName } from '@/domain/labels';
import type { Lift } from '@/domain/types';
import * as Haptics from 'expo-haptics';
import { Pressable, Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';

type LiftTabsProps = {
  enabled: readonly Lift[];
  selected: Lift;
  inProgressLift: Lift | null;
  onSelect: (lift: Lift) => void;
};

/** Short label used in the tab row (`Dead` for deadlift, otherwise full name). */
function shortName(lift: Lift): string {
  return lift === 'deadlift' ? 'Dead' : liftDisplayName(lift);
}

export function LiftTabs({ enabled, selected, inProgressLift, onSelect }: LiftTabsProps) {
  const { colors, spacing, type } = useTheme();

  const wrapperStyle: ViewStyle = {
    backgroundColor: colors.bg0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg + spacing.xs, // 20 = 16 + 4
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl + spacing.xs, // 28 = 24 + 4
  };

  return (
    <View style={wrapperStyle} testID="lift-tabs">
      {enabled.map((lift) => {
        const active = lift === selected;
        const inProg = lift === inProgressLift;

        const buttonStyle: ViewStyle = {
          paddingVertical: spacing.xs + 2, // ~6 = py-1.5 in tailwind (1.5 * 4 = 6)
          flexDirection: 'column',
          alignItems: 'center',
          gap: spacing.xs + 2, // 6 = gap-1.5
          minHeight: 44,
        };

        const labelRowStyle: ViewStyle = {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs + 2, // 6 = gap-1.5
        };

        const labelStyle: TextStyle = {
          fontFamily: type.mono,
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.22 * 11,
          textTransform: 'uppercase',
          color: active ? colors.ink0 : colors.ink3,
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

        return (
          <Pressable
            key={lift}
            onPress={handlePress}
            testID={`lift-tab-${lift}`}
            accessibilityRole="button"
            accessibilityLabel={`${liftDisplayName(lift)}${inProg ? ', session in progress' : ''}`}
            accessibilityState={{ selected: active }}
            style={buttonStyle}
          >
            <View style={labelRowStyle}>
              <RNText style={labelStyle}>{shortName(lift)}</RNText>
              {inProg ? <View style={dotStyle} testID={`lift-tab-${lift}-progress-dot`} /> : null}
            </View>
            <View style={underlineStyle} />
          </Pressable>
        );
      })}
    </View>
  );
}
