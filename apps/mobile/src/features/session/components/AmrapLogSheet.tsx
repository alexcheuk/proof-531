import { NumberStepper } from '@/design/primitives/NumberStepper';
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
 * AmrapLogSheet.tsx`. Uses the shared gorhom `Sheet` primitive (see
 * `~/Development/proof-531/apps/mobile/src/design/primitives/Sheet.tsx`).
 * Parent owns the actual `appendSetLog` call — this component only stages reps
 * and surfaces an e1RM caption.
 */
import { useState } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';

export type AmrapLogSheetProps = {
  open: boolean;
  lift: Lift;
  prescribedWeight: number;
  prescribedReps: number;
  unit: Unit;
  existingBestE1RM?: number | undefined;
  onCancel: () => void;
  onSave: (reps: number) => void;
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
  const [reps, setReps] = useState<number>(prescribedReps);
  const [pending, setPending] = useState(false);
  const { colors, spacing } = useTheme();

  function handleSave() {
    setPending(true);
    onSave(reps);
  }

  const predictedE1RMRaw = estimateOneRm(prescribedWeight, reps);
  const predictedE1RM = Math.round(predictedE1RMRaw);
  const isPotentialPR = predictedE1RMRaw > (existingBestE1RM ?? 0);

  const bodyStyle: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  };
  const headerRow: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  };
  const footerRow: ViewStyle = {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  };
  const button = (variant: 'primary' | 'ghost'): ViewStyle => ({
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: variant === 'primary' ? colors.ink0 : 'transparent',
    borderWidth: 1,
    borderColor: colors.ink0,
  });

  return (
    <Sheet open={open} onDismiss={onCancel} {...(testID !== undefined ? { testID } : {})}>
      <View style={bodyStyle}>
        <View style={headerRow}>
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
        </View>

        <View style={headerRow}>
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
            color="ink1"
            style={{ textTransform: 'uppercase', letterSpacing: 1.4 }}
          >
            EST. 1RM {predictedE1RM} {displayUnit(unit)}
            {isPotentialPR && reps > 0 ? ' · PR' : ''}
          </Text>
        </View>

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

        <View style={footerRow}>
          <Pressable
            testID="amrap-cancel"
            accessibilityRole="button"
            disabled={pending}
            onPress={onCancel}
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
        </View>
      </View>
    </Sheet>
  );
}
