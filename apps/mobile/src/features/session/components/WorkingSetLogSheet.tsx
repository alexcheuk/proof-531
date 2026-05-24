/**
 * Bottom-sheet working-set actual-rep logger (W1.3).
 *
 * Sibling component to `AmrapLogSheet` but for non-AMRAP working sets. Opens
 * via the split-CTA secondary button (`Log actual`) and writes a `kind:
 * 'working'` row with the user's actual rep count. No e1RM caption, no PR row,
 * no AMRAP framing — those are intentionally absent because non-AMRAP working
 * sets are not load-bearing for PR detection.
 *
 * Stepper pre-fills to `prescribedReps`; the user nudges down (missed reps) or
 * up (rare bonus rep). Range is `[0, prescribedReps + 5]` per spec — the
 * upper bound captures the realistic overshoot without inviting accidental
 * AMRAP-style entries.
 *
 * The footer reuses the same "outlined Cancel / filled Save" visual idiom as
 * `AmrapLogSheet`; the duplication is deliberate. Per the design spec the two
 * sheets share three concrete rows but diverge on what they compute — they
 * are not abstracted into a shared primitive yet.
 */
import { NumberStepper } from '@/design/primitives/NumberStepper';
import { Sheet } from '@/design/primitives/Sheet';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { liftDisplayName } from '@/domain/labels';
import type { Lift, Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';
import { useEffect, useState } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';

export type WorkingSetLogSheetProps = {
  open: boolean;
  lift: Lift;
  prescribedWeight: number;
  prescribedReps: number;
  unit: Unit;
  onCancel: () => void;
  onSave: (reps: number) => void;
  testID?: string | undefined;
};

export function WorkingSetLogSheet({
  open,
  lift,
  prescribedWeight,
  prescribedReps,
  unit,
  onCancel,
  onSave,
  testID,
}: WorkingSetLogSheetProps) {
  const { colors, spacing } = useTheme();
  const [reps, setReps] = useState<number>(prescribedReps);
  const [pending, setPending] = useState(false);

  // Re-sync the stepper to `prescribedReps` when the sheet is closed and then
  // re-opened with a different prescription (e.g. set 1 → set 2). Without
  // this the second open would still show the rep value from the first close.
  useEffect(() => {
    if (!open) {
      setReps(prescribedReps);
      setPending(false);
    }
  }, [open, prescribedReps]);

  function handleSave() {
    if (pending) return;
    setPending(true);
    onSave(reps);
  }

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
              LOG ACTUAL
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
            {prescribedWeight} {displayUnit(unit)} · PRESCRIBED {prescribedReps}
          </Text>
        </View>

        <NumberStepper
          value={reps}
          onChange={setReps}
          min={0}
          max={prescribedReps + 5}
          step={1}
          accessibilityLabelDecrement="Decrease reps"
          accessibilityLabelIncrement="Increase reps"
          testID="working-set-log-reps-stepper"
        />

        <View style={footerRow}>
          <Pressable
            testID="working-set-log-cancel"
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
            testID="working-set-log-save"
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
