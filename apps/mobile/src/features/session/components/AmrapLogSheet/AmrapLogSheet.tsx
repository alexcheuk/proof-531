import { CapsLabel } from '@/design/primitives/CapsLabel';
import { NumberStepper } from '@/design/primitives/NumberStepper';
import { Row } from '@/design/primitives/Row';
import { Sheet } from '@/design/primitives/Sheet';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { estimateOneRm } from '@/domain/epley';
import { liftDisplayName } from '@/domain/labels';
import type { Lift, Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';
/**
 * Bottom-sheet AMRAP rep logger.
 *
 * Structural port of `~/Development/531-pwa/src/features/session/components/
 * AmrapLogSheet.tsx`. Composition shell — rep/pending state lives in
 * `useAmrapLogState`, the e1RM caption is `ProjectionChip`, and the
 * Save/Cancel button pair is `AmrapFooter`.
 */
import { View, type ViewStyle } from 'react-native';
import { useAmrapLogState } from '../../hooks/useAmrapLogState';
import { AmrapFooter } from './AmrapFooter';
import { ProjectionChip } from './ProjectionChip';

export type AmrapLogSheetProps = {
  open: boolean;
  lift: Lift;
  prescribedWeight: number;
  prescribedReps: number;
  unit: Unit;
  existingBestE1RM?: number | undefined;
  onCancel: () => void;
  /**
   * Called when the user confirms a rep count. May be sync or async — the
   * sheet awaits the returned value so the disabled state resolves on parent
   * resolution (and on parent error, falls back to re-enabling the buttons so
   * the user can retry).
   */
  onSave: (reps: number) => void | Promise<void>;
  testID?: string | undefined;
};

export function AmrapLogSheet({
  open,
  lift,
  prescribedWeight,
  prescribedReps,
  unit,
  existingBestE1RM,
  onCancel,
  onSave,
  testID,
}: AmrapLogSheetProps) {
  const { spacing } = useTheme();
  const { reps, setReps, pending, handleSave, handleCancel } = useAmrapLogState({
    open,
    prescribedReps,
    onSave,
    onCancel,
  });

  const predictedE1RMRaw = estimateOneRm(prescribedWeight, reps);
  const predictedE1RM = Math.round(predictedE1RMRaw);
  const existingBest = existingBestE1RM ?? 0;
  const isPotentialPR = reps > 0 && predictedE1RMRaw > existingBest;
  // Real-time delta against the user's current PR. Only surfaced when the
  // user has a prior PR (no baseline → no delta to brag about).
  const deltaFromBest = existingBest > 0 ? predictedE1RM - Math.round(existingBest) : null;
  // Felt-quality affirmation as the user dials in reps well above the
  // prescribed minimum (the "+" of 5+/3+/1+). +3 over feels like a big set.
  const showBigSetCaption = reps >= prescribedReps + 3;

  const bodyStyle: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  };

  return (
    <Sheet open={open} onDismiss={handleCancel} {...(testID !== undefined ? { testID } : {})}>
      <View style={bodyStyle}>
        <Row justify="space-between" align="baseline" style={{ marginBottom: spacing.md }}>
          <View>
            <CapsLabel weight="semibold">LOG AMRAP</CapsLabel>
            <Text variant="sans" weight="medium" size={24} color="ink0">
              {liftDisplayName(lift)}
            </Text>
          </View>
          <CapsLabel size="md" weight="semibold" style={{ letterSpacing: 1.8 }}>
            {`${prescribedWeight} ${displayUnit(unit)}`}
          </CapsLabel>
        </Row>

        <Row justify="space-between" align="center" style={{ marginBottom: spacing.md }}>
          <CapsLabel weight="semibold" style={{ letterSpacing: 1.5 }}>
            How many reps?
          </CapsLabel>
          <ProjectionChip
            predictedE1RM={predictedE1RM}
            unit={unit}
            deltaFromBest={deltaFromBest}
            reps={reps}
            isPotentialPR={isPotentialPR}
            testID="amrap-e1rm-caption"
          />
        </Row>

        <NumberStepper
          value={reps}
          onChange={setReps}
          min={0}
          max={30}
          step={1}
          accessibilityLabelDecrement="Decrease reps"
          accessibilityLabelIncrement="Increase reps"
          testID="amrap-reps-stepper"
        />

        {showBigSetCaption ? (
          <CapsLabel
            weight="bold"
            color="ink0"
            style={{ marginTop: spacing.sm, letterSpacing: 1.4, textAlign: 'center' }}
            testID="amrap-big-set"
          >
            BIG SET.
          </CapsLabel>
        ) : null}

        <AmrapFooter pending={pending} onCancel={handleCancel} onSave={handleSave} />
      </View>
    </Sheet>
  );
}
