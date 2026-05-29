import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Divider } from '@/design/primitives/Divider';
import { Text } from '@/design/primitives/Text';
import { TopSetBlock } from '@/design/primitives/TopSetBlock';
import { useTheme } from '@/design/theme';
import type { Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';
/**
 * Full-body rendering of the Live screen's `rest` phase.
 *
 * Layout: "SET COMPLETED" caps eyebrow, "Rest." display headline, hairline
 * divider, the count-down RestTimer, and an optional NEXT SET preview block
 * so the user can prep plates while the timer ticks.
 *
 * Undo lives on the top bar during rest — RestPhase no longer renders an
 * inline undo button (removed 2026-05-24 per user feedback that the
 * duplicate was visual noise).
 *
 * Note: working sets (non-AMRAP) never produce e1RM PRs. After an AMRAP set
 * the live screen goes directly to `pr-celebration` rather than entering
 * rest, so there is no "PR during rest" case to render here.
 */
import { Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
import { RestTimer } from './RestTimer';

export type RestPhaseProps = {
  /** Display unit (`'lbs' | 'kg'` — rendered via `displayUnit()` as `lb | kg`). */
  loggedUnit: Unit;
  /** Seconds remaining in the countdown (forwarded to RestTimer). */
  remaining: number;
  /** Optional ±30s / Skip controls — forwarded to RestTimer. */
  onAddRest?: () => void;
  onSubRest?: () => void;
  onSkip?: () => void;
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
  remaining,
  onAddRest,
  onSubRest,
  onSkip,
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
  const headlineStyle: TextStyle = {
    fontFamily: `${type.sans}-Bold`,
    fontSize: 64,
    // 'Rest' has no descenders, but keep lineHeight: 74 to match the Set-phase
    // headlines (same font, same baseline grid). See loop-memory/09-rn-text-clipping.md.
    lineHeight: 74,
    letterSpacing: -1.92,
    color: colors.ink0,
  };

  return (
    <View testID={testID ?? 'rest-phase'}>
      <View style={headerWrap}>
        <CapsLabel weight="semibold" style={{ marginBottom: 8 }} testID="rest-phase-eyebrow">
          SET COMPLETED
        </CapsLabel>

        <RNText style={headlineStyle} testID="rest-phase-headline">
          Rest
          <Text variant="sans" weight="bold" size={64} color="amber" style={{ lineHeight: 74 }}>
            .
          </Text>
        </RNText>
      </View>

      <Divider />

      <RestTimer
        remaining={remaining}
        {...(onAddRest ? { onAddRest } : {})}
        {...(onSubRest ? { onSubRest } : {})}
        {...(onSkip ? { onSkip } : {})}
        testID="rest-timer"
      />

      <Divider />

      {nextSet ? (
        <>
          <View
            style={{ paddingHorizontal: spacing.xl, paddingVertical: spacing.lg }}
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
          <Divider />
        </>
      ) : null}
    </View>
  );
}
