import { Text } from '@/design/primitives/Text';
import { TopSetBlock } from '@/design/primitives/TopSetBlock';
import { useTheme } from '@/design/theme';
import type { Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';
/**
 * Full-body rendering of the Live screen's `rest` phase.
 *
 * Layout (post W2.1 merge):
 *   1. Headline band — caps eyebrow + 64pt "Stronger." / "Rest." (main).
 *   2. LOGGED band   — single row: "{weight} {unit} × {reps}" left,
 *                       "EST. 1RM {x} {unit}[ · PR]" right (Wave 2 W2.1).
 *   3. RestTimer     — 96pt countdown + optional skip / +30s controls.
 *   4. NEXT SET band — TopSetBlock + plate-load instruction caption (W2.1).
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
  /** Just-logged display weight — drives the LOGGED band (W2.1). */
  loggedWeight?: number;
  /** Just-logged actual reps — drives the LOGGED band (W2.1). */
  loggedReps?: number;
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
  /**
   * Optional plate-load instruction line, rendered below the NEXT SET
   * `TopSetBlock` (W2.1). Pre-formatted by the caller via
   * `plateLoadInstruction(...)`.
   */
  plateInstruction?: string;
  /** W2.2 — skip the rest (forces restRemaining to 0). */
  onSkipRest?: () => void;
  /** W2.2 — add 30 seconds to the rest. */
  onAddRest?: () => void;
  testID?: string;
};

export function RestPhase({
  loggedUnit,
  estimated1RM,
  isAmrap = false,
  isPR = false,
  loggedWeight,
  loggedReps,
  remaining,
  target,
  nextSet,
  plateInstruction,
  onSkipRest,
  onAddRest,
  testID,
}: RestPhaseProps) {
  const { colors, type, spacing } = useTheme();
  const unitLabel = displayUnit(loggedUnit);
  const showLogged = loggedWeight !== undefined && loggedReps !== undefined;

  const headerWrap: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  };
  const headlineStyle: TextStyle = {
    fontFamily: `${type.sans}-Bold`,
    fontSize: 64,
    lineHeight: 64,
    letterSpacing: -1.92,
    color: colors.ink0,
  };

  const loggedBandWrap: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  };
  const loggedValueStyle: TextStyle = {
    fontFamily: `${type.sans}-Medium`,
    fontSize: 22,
    lineHeight: 22,
    color: colors.ink0,
    fontVariant: ['tabular-nums', 'lining-nums'],
    marginTop: 4,
  };
  const e1rmStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.ink1,
  };

  const plateInstructionStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.ink2,
    marginTop: spacing.sm,
    textAlign: 'center',
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

      {showLogged ? (
        <>
          <View style={loggedBandWrap} testID="rest-phase-logged" accessibilityLabel="Logged set">
            <View>
              <Text
                variant="mono"
                weight="semibold"
                size={10}
                color="ink2"
                style={{ textTransform: 'uppercase', letterSpacing: 2.2 }}
              >
                LOGGED
              </Text>
              <RNText style={loggedValueStyle} testID="rest-phase-logged-value">
                {loggedWeight} {unitLabel} × {loggedReps}
              </RNText>
            </View>
            {showE1RM ? (
              <RNText style={e1rmStyle} testID="rest-phase-logged-e1rm">
                EST. 1RM {estimated1RM} {unitLabel}
                {isPR ? ' · PR' : ''}
              </RNText>
            ) : null}
          </View>
          <View style={{ borderBottomWidth: 1, borderBottomColor: colors.line }} />
        </>
      ) : null}

      <RestTimer
        remaining={remaining}
        target={target}
        testID="rest-timer"
        {...(onSkipRest !== undefined ? { onSkipRest } : {})}
        {...(onAddRest !== undefined ? { onAddRest } : {})}
      />

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
            {plateInstruction ? (
              <RNText style={plateInstructionStyle} testID="rest-phase-plate-instruction">
                {plateInstruction}
              </RNText>
            ) : null}
          </View>
          <View style={{ borderBottomWidth: 1, borderBottomColor: colors.line }} />
        </>
      ) : null}
    </View>
  );
}
