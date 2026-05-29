import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Divider } from '@/design/primitives/Divider';
import { Text } from '@/design/primitives/Text';
import { TopSetBlock } from '@/design/primitives/TopSetBlock';
import { useTheme } from '@/design/theme';
import type { Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';
import { Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
import { RestTimer } from './RestTimer';

export type RestPhaseProps = {
  loggedUnit: Unit;
  remaining: number;
  onAddRest?: () => void;
  onSubRest?: () => void;
  onSkip?: () => void;
  nextSet?: {
    weight: number;
    reps: number;
    amrap: boolean;
    /** Top-set % of TM (0..1). */
    pct: number;
    /** Plate decomposition, heaviest first. */
    perSide: readonly number[];
    /** TM in display unit, for the caption. */
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
