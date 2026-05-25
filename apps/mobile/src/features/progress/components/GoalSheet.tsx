/**
 * GoalSheet — bottom sheet for setting / editing / clearing a per-lift e1RM
 * goal. Wraps `SheetLayout` with a NumberStepper body, a live "in ~M
 * cycles" recompute line, and Save / Clear actions.
 *
 * Saving is optimistic via `useSetLiftGoal` — the underlying Progress
 * goal strip updates the moment the user taps Save; the sheet closes
 * immediately on `onSettled` so the user never sees a spinner.
 */
import { NumberStepper } from '@/design/primitives/NumberStepper';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { SheetLayout } from '@/design/primitives/SheetLayout';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { liftDisplayName } from '@/domain/labels';
import { cyclesUntilGoal } from '@/domain/progression';
import type { Lift, Unit } from '@/domain/types';
import { round } from '@/domain/units';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { View, type ViewStyle } from 'react-native';

export type GoalSheetProps = {
  open: boolean;
  onDismiss: () => void;
  lift: Lift;
  unit: Unit; // display unit
  /** Current goal value in display units, or null when unset. */
  currentGoal: number | null;
  /** Best e1RM seen for this lift (display units), or 0 — used for stretch fallback. */
  bestE1RM: number;
  /** Current TM in display units — fallback when bestE1RM is 0. */
  currentTm: number;
  /** Current cycle for live cycles-to-go recompute. */
  currentCycle: number;
  /** Rolling AMRAP margin for live cycles-to-go recompute. */
  rollingMargin: number;
  /** Save mutation. */
  onSave: (targetE1RM: number) => Promise<void> | void;
  onClear: () => Promise<void> | void;
  testID?: string;
};

const STEP_LBS = 5;
const STEP_KG = 2.5;

export function GoalSheet({
  open,
  onDismiss,
  lift,
  unit,
  currentGoal,
  bestE1RM,
  currentTm,
  currentCycle,
  rollingMargin,
  onSave,
  onClear,
  testID,
}: GoalSheetProps) {
  const { colors, spacing } = useTheme();
  const step = unit === 'lbs' ? STEP_LBS : STEP_KG;
  const unitGlyph = unit === 'lbs' ? 'lb' : 'kg';

  const initialValue = computeInitial(currentGoal, bestE1RM, currentTm, unit);
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  // Re-seed the stepper when the sheet (re-)opens so the user always sees
  // the right starting value if the goal was edited elsewhere.
  useEffect(() => {
    if (open) {
      setValue(computeInitial(currentGoal, bestE1RM, currentTm, unit));
    }
  }, [open, currentGoal, bestE1RM, currentTm, unit]);

  const liveCycles = cyclesUntilGoal(
    value,
    bestE1RM,
    currentTm,
    currentCycle,
    rollingMargin,
    lift,
    unit,
  );

  const subLine =
    liveCycles === null
      ? 'out of horizon'
      : liveCycles === 0
        ? 'already past — pick a higher target'
        : `in ~${liveCycles} cycle${liveCycles === 1 ? '' : 's'}`;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(value);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onDismiss();
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    try {
      await onClear();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onDismiss();
    } finally {
      setSaving(false);
    }
  };

  const bodyStyle: ViewStyle = {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  };

  return (
    <SheetLayout
      open={open}
      onDismiss={onDismiss}
      eyebrow={`GOAL · ${liftDisplayName(lift).toUpperCase()} e1RM`}
      title=" "
      titleVariant="compact"
      pending={saving}
      {...(testID !== undefined ? { testID } : {})}
      primary={
        <PrimaryPillButton
          onPress={handleSave}
          disabled={saving}
          testID={`${testID ?? 'goal-sheet'}-save`}
          accessibilityLabel={`Save goal of ${value} ${unitGlyph}`}
        >
          Save goal
        </PrimaryPillButton>
      }
      {...(currentGoal !== null
        ? {
            cancel: {
              label: 'Clear goal',
              onPress: () => {
                void handleClear();
              },
              variant: 'text',
              testID: `${testID ?? 'goal-sheet'}-clear`,
            },
          }
        : {})}
    >
      <View style={bodyStyle}>
        <NumberStepper
          value={value}
          onChange={setValue}
          unit={unit}
          step={step}
          min={0}
          max={2000}
          testID={`${testID ?? 'goal-sheet'}-stepper`}
        />
        <Text
          variant="mono"
          weight="medium"
          size={11}
          color="ink3"
          style={{ letterSpacing: 1.2, paddingHorizontal: spacing.md, color: colors.ink3 }}
        >
          {subLine}
        </Text>
      </View>
    </SheetLayout>
  );
}

function computeInitial(
  currentGoal: number | null,
  bestE1RM: number,
  currentTm: number,
  unit: Unit,
): number {
  if (currentGoal !== null && currentGoal > 0) return currentGoal;
  if (bestE1RM > 0) return round(bestE1RM * 1.15, unit);
  if (currentTm > 0) return round(currentTm * 1.15, unit);
  return unit === 'lbs' ? 100 : 50;
}
