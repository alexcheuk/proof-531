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
 * Structural port of `~/Development/531-pwa/src/features/session/components/
 * RestPhase.tsx`. Layout: caps eyebrow ("SET COMPLETED · NEW PERSONAL
 * RECORD"), display headline ("Rest." or "Stronger." on a PR), hairline
 * divider, the count-up RestTimer, and an optional NEXT SET preview block
 * so the user can prep plates while the timer ticks.
 */
import { Pressable, Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
import { RestTimer } from './RestTimer';

export type RestPhaseProps = {
  /** Display unit (`'lbs' | 'kg'` — rendered via `displayUnit()` as `lb | kg`). */
  loggedUnit: Unit;
  /** Optional estimated 1RM (AMRAP only). Currently surfaced inside the timer card; reserved for future on-RestPhase callouts. */
  estimated1RM?: number | undefined;
  /** True if the just-logged set was an AMRAP set. Reserved for future PR-specific copy. */
  isAmrap?: boolean;
  /** True if the just-logged set is a PR (drives celebratory copy). */
  isPR?: boolean;
  /** Seconds remaining in the countdown (forwarded to RestTimer). */
  remaining: number;
  /** Total configured rest target — forwarded to RestTimer for the count-up math. */
  target: number;
  /** Optional ±30s / Skip controls — forwarded to RestTimer. */
  onAddRest?: () => void;
  onSubRest?: () => void;
  onSkip?: () => void;
  /**
   * Optional "undo last set" affordance. Rendered as a subtle text/glyph
   * Pressable between the RestTimer and the NEXT SET block when provided.
   * Hidden entirely when omitted (so the rest-after-AMRAP transition, which
   * cannot be undone in this iteration, simply doesn't pass the callback).
   */
  onUndoLastSet?: () => void;
  /** Override the undo affordance copy. Defaults to `↶ Undo last set`. */
  undoLabel?: string;
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
  isPR = false,
  remaining,
  target,
  onAddRest,
  onSubRest,
  onSkip,
  onUndoLastSet,
  undoLabel = '↶ Undo last set',
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
    lineHeight: 64,
    letterSpacing: -1.92,
    color: colors.ink0,
  };

  return (
    <View testID={testID ?? 'rest-phase'}>
      <View style={headerWrap}>
        <CapsLabel weight="semibold" style={{ marginBottom: 8 }} testID="rest-phase-eyebrow">
          {isPR ? 'SET COMPLETED · NEW PERSONAL RECORD' : 'SET COMPLETED'}
        </CapsLabel>

        <RNText style={headlineStyle} testID="rest-phase-headline">
          {isPR ? 'Stronger' : 'Rest'}
          <Text variant="sans" weight="bold" size={64} color="amber" style={{ lineHeight: 74 }}>
            .
          </Text>
        </RNText>
      </View>

      <Divider />

      <RestTimer
        remaining={remaining}
        target={target}
        {...(onAddRest ? { onAddRest } : {})}
        {...(onSubRest ? { onSubRest } : {})}
        {...(onSkip ? { onSkip } : {})}
        testID="rest-timer"
      />

      {onUndoLastSet ? (
        <Pressable
          onPress={onUndoLastSet}
          accessibilityRole="button"
          accessibilityLabel={undoLabel}
          hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
          style={({ pressed }) => ({
            alignSelf: 'center',
            // 44pt minimum touch target — paddingVertical 12 + the CapsLabel
            // glyph's intrinsic line-height clears the AA threshold.
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            opacity: pressed ? 0.5 : 1,
          })}
          testID="rest-phase-undo"
        >
          <CapsLabel color="ink2" weight="medium">
            {undoLabel}
          </CapsLabel>
        </Pressable>
      ) : null}

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
