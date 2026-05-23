import { SectionBand } from '@/design/primitives/SectionBand';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';
/**
 * Full-body rendering of the Live screen's `rest` phase.
 *
 * Structural port of `~/Development/531-pwa/src/features/session/components/
 * RestPhase.tsx`. Layout: caps eyebrow ("LOGGED · REST NOW" / "NEW PERSONAL
 * RECORD"), display headline ("Breathe." / "Stronger."), SectionBand row with
 * LOGGED stat on the left and optional EST. 1RM stat on the right (AMRAP
 * only), and the count-up RestTimer below.
 */
import { Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
import { RestTimer } from './RestTimer';

export type RestPhaseProps = {
  /** Weight of the just-logged set, in the session's display unit. */
  loggedWeight: number;
  /** Actual reps logged (= prescribed reps for working sets; AMRAP entry for AMRAP). */
  loggedReps: number;
  /** Display unit (`'lbs' | 'kg'` — rendered via `displayUnit()` as `lb | kg`). */
  loggedUnit: Unit;
  /** Optional estimated 1RM (AMRAP only). */
  estimated1RM?: number | undefined;
  /** True if the just-logged set was an AMRAP set (drives EST. 1RM column). */
  isAmrap?: boolean;
  /** True if the just-logged set is a PR (drives celebratory copy). */
  isPR?: boolean;
  /** Seconds remaining in the countdown (forwarded to RestTimer). */
  remaining: number;
  /** Total configured rest target — forwarded to RestTimer for the count-up math. */
  target: number;
  testID?: string;
};

export function RestPhase({
  loggedWeight,
  loggedReps,
  loggedUnit,
  estimated1RM,
  isAmrap = false,
  isPR = false,
  remaining,
  target,
  testID,
}: RestPhaseProps) {
  const { colors, type, spacing } = useTheme();
  const unitLabel = displayUnit(loggedUnit);

  const headerWrap: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  };
  const sectionBandWrap: ViewStyle = {
    marginHorizontal: spacing.xl,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
  };
  const headlineStyle: TextStyle = {
    fontFamily: `${type.sans}-Medium`,
    fontSize: 64,
    lineHeight: 64,
    letterSpacing: -1.92,
    color: colors.ink0,
  };
  const statLabelStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
    marginBottom: 6,
  };
  const statBigStyle: TextStyle = {
    fontFamily: `${type.sans}-Medium`,
    fontSize: 32,
    lineHeight: 32,
    letterSpacing: -0.96,
    color: colors.ink0,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };
  const statCapsStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
  };
  const statRepsStyle: TextStyle = {
    fontFamily: `${type.sans}-Medium`,
    fontSize: 22,
    lineHeight: 22,
    letterSpacing: -0.44,
    color: colors.ink1,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };
  const e1rmBigStyle: TextStyle = {
    fontFamily: `${type.sans}-Medium`,
    fontSize: 26,
    lineHeight: 26,
    letterSpacing: -0.78,
    color: colors.ink0,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };

  const showE1RM = isAmrap && estimated1RM !== undefined;

  return (
    <View testID={testID ?? 'rest-phase'}>
      <View style={headerWrap}>
        <Text
          variant="mono"
          weight="semibold"
          size={10}
          color="ink2"
          style={{ textTransform: 'uppercase', letterSpacing: 2.2, marginBottom: 8 }}
          testID="rest-phase-eyebrow"
        >
          {isPR ? 'NEW PERSONAL RECORD' : 'LOGGED · REST NOW'}
        </Text>
        <RNText style={headlineStyle} testID="rest-phase-headline">
          {isPR ? 'Stronger.' : 'Breathe.'}
        </RNText>
      </View>

      <SectionBand padding="none" style={sectionBandWrap} testID="rest-phase-stats">
        <View>
          <RNText style={statLabelStyle}>LOGGED</RNText>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
            <RNText style={statBigStyle}>{loggedWeight}</RNText>
            <RNText style={[statCapsStyle, { paddingBottom: 4 }]}>{unitLabel}</RNText>
            <RNText style={statRepsStyle}>× {loggedReps}</RNText>
          </View>
        </View>
        {showE1RM ? (
          <View style={{ alignItems: 'flex-end' }}>
            <RNText style={statLabelStyle}>EST. 1RM</RNText>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
              <RNText style={e1rmBigStyle} testID="rest-phase-e1rm">
                {Math.round(estimated1RM as number)}
              </RNText>
              <RNText style={[statCapsStyle, { paddingBottom: 3 }]}>{unitLabel}</RNText>
            </View>
          </View>
        ) : null}
      </SectionBand>

      <RestTimer remaining={remaining} target={target} testID="rest-timer" />
    </View>
  );
}
