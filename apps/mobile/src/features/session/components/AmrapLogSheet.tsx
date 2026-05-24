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
 * AmrapLogSheet.tsx`. Parent owns the actual `appendSetLog` call — this
 * component only stages reps and surfaces an e1RM caption. Rep/pending state
 * lives in `useAmrapLogState` so the sheet body is pure presentation.
 */
import { Pressable, View, type ViewStyle } from 'react-native';
import { useAmrapLogState } from '../hooks/useAmrapLogState';

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
  const { colors, spacing } = useTheme();
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
  // Real-time delta against the user's current PR — the felt-quality win is
  // watching "+12" tick up as you crank out another rep on the AMRAP. Only
  // surfaced when the user has a prior PR.
  const deltaFromBest = existingBest > 0 ? predictedE1RM - Math.round(existingBest) : null;

  const bodyStyle: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  };
  const button = (variant: 'primary' | 'ghost'): ViewStyle => ({
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: variant === 'primary' ? colors.ink0 : 'transparent',
    borderWidth: 1,
    borderColor: colors.ink0,
    opacity: pending ? 0.6 : 1,
  });

  return (
    <Sheet open={open} onDismiss={handleCancel} {...(testID !== undefined ? { testID } : {})}>
      <View style={bodyStyle}>
        <Row justify="space-between" align="baseline" style={{ marginBottom: spacing.md }}>
          <View>
            <Text
              variant="mono"
              weight="semibold"
              size={10}
              color="ink2"
              style={{ textTransform: 'uppercase', letterSpacing: 2.2 }}
            >
              LOG AMRAP
            </Text>
            <Text variant="sans" weight="medium" size={24} color="ink0">
              {liftDisplayName(lift)}
            </Text>
          </View>
          <Text
            variant="mono"
            weight="semibold"
            size={11}
            color="ink2"
            style={{ textTransform: 'uppercase', letterSpacing: 1.8 }}
          >
            {prescribedWeight} {displayUnit(unit)}
          </Text>
        </Row>

        <Row justify="space-between" align="baseline" style={{ marginBottom: spacing.md }}>
          <Text
            variant="mono"
            weight="semibold"
            size={10}
            color="ink2"
            style={{ textTransform: 'uppercase', letterSpacing: 1.5 }}
          >
            HOW MANY REPS?
          </Text>
          <Text
            variant="mono"
            weight="semibold"
            size={10}
            color={isPotentialPR ? 'ink0' : 'ink1'}
            style={{ textTransform: 'uppercase', letterSpacing: 1.4 }}
            testID="amrap-e1rm-caption"
          >
            EST. 1RM {predictedE1RM} {displayUnit(unit)}
            {deltaFromBest !== null && reps > 0
              ? ` · ${deltaFromBest >= 0 ? '+' : ''}${deltaFromBest} from best`
              : ''}
            {isPotentialPR ? ' · PR' : ''}
          </Text>
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

        <Row gap="md" style={{ marginTop: spacing.lg }}>
          <Pressable
            testID="amrap-cancel"
            accessibilityRole="button"
            disabled={pending}
            onPress={handleCancel}
            style={button('ghost')}
          >
            <Text
              variant="sans"
              weight="semibold"
              size={13}
              color="ink0"
              style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
            >
              Cancel
            </Text>
          </Pressable>
          <Pressable
            testID="amrap-save"
            accessibilityRole="button"
            disabled={pending}
            onPress={handleSave}
            style={button('primary')}
          >
            <Text
              variant="sans"
              weight="semibold"
              size={13}
              color="bg0"
              style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
            >
              Save
            </Text>
          </Pressable>
        </Row>
      </View>
    </Sheet>
  );
}
