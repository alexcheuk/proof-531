import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Divider } from '@/design/primitives/Divider';
import { Text } from '@/design/primitives/Text';
import { TopSetBlock } from '@/design/primitives/TopSetBlock';
import { useTheme } from '@/design/theme';
import type { Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';
import { View, type ViewStyle } from 'react-native';
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
  const { spacing } = useTheme();
  const unitLabel = displayUnit(loggedUnit);

  const headerWrap: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  };

  return (
    <View testID={testID ?? 'rest-phase'}>
      <View style={headerWrap}>
        <CapsLabel weight="semibold" style={{ marginBottom: 8 }} testID="rest-phase-eyebrow">
          SET COMPLETED
        </CapsLabel>

        {/* rn-line-height-ok: single-word headline, no descenders */}
        <Text
          variant="sans"
          weight="bold"
          size={64}
          color="ink0"
          style={{ lineHeight: 74, letterSpacing: -1.92 }}
          testID="rest-phase-headline"
        >
          Rest
          <Text variant="sans" weight="bold" size={64} color="amber" style={{ lineHeight: 74 }}>
            .
          </Text>
        </Text>
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
