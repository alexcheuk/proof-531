import { Text } from '@/design/primitives/Text';
import { TopSetBlock } from '@/design/primitives/TopSetBlock';
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
  /**
   * Optional preview of the upcoming set — rendered as a TopSetBlock so the
   * user can prep plates while the timer counts down. Omit on the terminal
   * rest (no next set), though the live state machine currently never
   * enters rest after the last working/AMRAP set.
   */
  nextSet?: {
    weight: number;
    reps: number;
    amrap: boolean;
    /** Top-set % of TM (0..1). */
    pct: number;
    /** Pre-computed plate decomposition (heaviest first). */
    perSide: readonly number[];
    /** TM in display unit, for the "TM 245 lb" caption. */
    tmDisplay: number;
  };
  testID?: string;
};

export function RestPhase({
  loggedUnit,
  estimated1RM,
  isAmrap = false,
  isPR = false,
  remaining,
  target,
  nextSet,
  testID,
}: RestPhaseProps) {
  const { colors, type, spacing } = useTheme();
  const unitLabel = displayUnit(loggedUnit);

  const headerWrap: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  };
  const _sectionBandWrap: ViewStyle = {
    marginHorizontal: spacing.xl,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
  };
  const headlineStyle: TextStyle = {
    fontFamily: `${type.sans}-Bold`,
    fontSize: 64,
    lineHeight: 64,
    letterSpacing: -1.92,
    color: colors.ink0,
  };
  const _statLabelStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
    marginBottom: 6,
  };
  const _statCapsStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
  };
  const _e1rmBigStyle: TextStyle = {
    fontFamily: `${type.sans}-Medium`,
    fontSize: 26,
    lineHeight: 26,
    letterSpacing: -0.78,
    color: colors.ink0,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };

  const _showE1RM = isAmrap && estimated1RM !== undefined;

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
          {isPR ? 'SET COMPLETED · NEW PERSONAL RECORD' : 'SET COMPLETED'}
        </Text>

        <RNText style={headlineStyle} testID="rest-phase-headline">
          {isPR ? 'Stronger' : 'Rest'}
          <Text
            variant="sans"
            weight="bold"
            size={64}
            color="amber"
            style={{
              lineHeight: 74,
            }}
          >
            .
          </Text>
        </RNText>
      </View>

      <View style={{ borderBottomWidth: 1, borderBottomColor: colors.line }} />

      <RestTimer remaining={remaining} target={target} testID="rest-timer" />

      <View style={{ borderBottomWidth: 1, borderBottomColor: colors.line }} />

      {nextSet ? (
        <>
          <View
            style={{
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.lg,
            }}
            testID="rest-phase-next-set"
          >
            <TopSetBlock
              eyebrow="NEXT SET"
              weight={nextSet.weight}
              unitGlyph={unitLabel}
              reps={nextSet.reps}
              amrap={nextSet.amrap}
              pctLabel={`${Math.round(nextSet.pct * 100)}%`}
              tmLabel={`TM ${nextSet.tmDisplay} ${unitLabel}`}
              perSide={nextSet.perSide}
              plateVariant="full"
              bordered={false}
              testID="rest-phase-next-set-block"
            />
          </View>
          <View style={{ borderBottomWidth: 1, borderBottomColor: colors.line }} />
        </>
      ) : null}
    </View>
  );
}
