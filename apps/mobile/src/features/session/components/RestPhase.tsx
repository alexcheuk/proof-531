import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';
/**
 * Full-body rendering of the Live screen's `rest` phase.
 *
 * Structural port of `~/Development/531-pwa/src/features/session/components/
 * RestPhase.tsx`. Layout mirrors the PWA proportions: caps eyebrow, large
 * weight×reps headline, optional e1RM sub-line, hairline separator, and a
 * prominent 96-px countdown timer below.
 *
 * Numeric direction differs from the PWA — the PWA counts UP (free-form rest),
 * we count DOWN from a configurable target (PG-04 lands `restTargetSeconds`
 * in settings; the parent passes `remaining` + `target` through).
 */
import { View, type ViewStyle } from 'react-native';
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
  /** Seconds remaining in the countdown (forwarded to RestTimer). */
  remaining: number;
  /** Total configured rest target — used for the "of m:ss" context line. */
  target: number;
  testID?: string;
};

export function RestPhase({
  loggedWeight,
  loggedReps,
  loggedUnit,
  estimated1RM,
  remaining,
  target,
  testID,
}: RestPhaseProps) {
  const { colors, spacing } = useTheme();
  const unitLabel = displayUnit(loggedUnit);

  const containerStyle: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  };
  const summaryBlock: ViewStyle = {
    marginTop: spacing.md,
  };
  const hairline: ViewStyle = {
    height: 1,
    backgroundColor: colors.lineStrong,
    marginTop: spacing.xl,
  };

  return (
    <View testID={testID ?? 'rest-phase'} style={containerStyle}>
      <Text
        variant="mono"
        weight="semibold"
        size={10}
        color="ink2"
        style={{ textTransform: 'uppercase', letterSpacing: 2.2, marginBottom: 6 }}
        testID="rest-phase-eyebrow"
      >
        Just logged
      </Text>
      <Text
        variant="sans"
        weight="bold"
        size={56}
        color="ink0"
        style={{ letterSpacing: -1.96, lineHeight: 64 }}
        testID="rest-phase-headline"
      >
        {loggedWeight} × {loggedReps}{' '}
        <Text
          variant="mono"
          weight="semibold"
          size={14}
          color="ink2"
          style={{ textTransform: 'uppercase', letterSpacing: 2.52 }}
        >
          {unitLabel}
        </Text>
      </Text>
      {estimated1RM !== undefined ? (
        <View style={summaryBlock}>
          <Text
            variant="mono"
            weight="medium"
            size={11}
            color="ink2"
            style={{ textTransform: 'uppercase', letterSpacing: 1.98 }}
            testID="rest-phase-e1rm"
          >
            e1RM {Math.round(estimated1RM)} {unitLabel}
          </Text>
        </View>
      ) : null}
      <View style={hairline} />
      <RestTimer remaining={remaining} target={target} testID="rest-timer" />
    </View>
  );
}
