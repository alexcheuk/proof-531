import { useDb } from '@/data/DbProvider';
import { countCompletedSessionsForLift } from '@/data/accessors/rollbackLift';
import { NumberStepper } from '@/design/primitives/NumberStepper';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { SheetLayout } from '@/design/primitives/SheetLayout';
import { useTheme } from '@/design/theme';
import { liftDisplayName } from '@/domain/labels';
import type { Lift } from '@/domain/types';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Pressable, Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';

export interface RollbackLiftSheetProps {
  open: boolean;
  enabledLifts: Lift[];
  onClose: () => void;
  onConfirm: (lift: Lift, n: number) => void;
  pending?: boolean;
}

export function RollbackLiftSheet({
  open,
  enabledLifts,
  onClose,
  onConfirm,
  pending = false,
}: RollbackLiftSheetProps) {
  const { colors, type, spacing } = useTheme();
  const db = useDb();
  const [selectedLift, setSelectedLift] = useState<Lift | null>(enabledLifts[0] ?? null);
  const [sessionCount, setSessionCount] = useState(1);

  const { data: maxSessions = 0 } = useQuery({
    queryKey: ['rollback-count', selectedLift],
    queryFn: () =>
      selectedLift ? countCompletedSessionsForLift(db, selectedLift) : Promise.resolve(0),
    enabled: open && selectedLift != null,
  });

  // Clamp when the max changes (switching lifts or on open)
  useEffect(() => {
    if (sessionCount > maxSessions && maxSessions > 0) {
      setSessionCount(maxSessions);
    }
  }, [maxSessions, sessionCount]);

  // Reset to 1 when the selected lift changes.
  useEffect(() => {
    if (selectedLift != null) setSessionCount(1);
  }, [selectedLift]);

  const isValid = selectedLift != null && maxSessions > 0;

  const labelStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink3,
    marginBottom: spacing.xs,
  };

  const bodyTextStyle: TextStyle = {
    fontFamily: type.sans,
    fontSize: 13,
    lineHeight: 19,
    color: colors.ink2,
  };

  const liftRowStyle: ViewStyle = {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  };

  const makeLiftChipStyle = (active: boolean): ViewStyle => ({
    borderWidth: 1,
    borderColor: active ? colors.ink0 : colors.ink3,
    backgroundColor: active ? colors.ink0 : colors.bg0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  });

  const makeLiftChipLabelStyle = (active: boolean): TextStyle => ({
    fontFamily: `${type.sans}-Medium`,
    fontSize: 13,
    color: active ? colors.bg0 : colors.ink2,
  });

  return (
    <SheetLayout
      open={open}
      onDismiss={onClose}
      testID="rollback-lift-sheet"
      snapPoints={['60%']}
      eyebrow="DANGER ZONE"
      title="Roll back a lift"
      pending={pending}
      primary={
        <PrimaryPillButton
          testID="rollback-confirm"
          onPress={() => {
            if (selectedLift && isValid) onConfirm(selectedLift, sessionCount);
          }}
          disabled={!isValid || pending}
          glyph="→"
          accessibilityLabel={
            selectedLift
              ? `Roll back ${sessionCount} ${liftDisplayName(selectedLift)} session${sessionCount > 1 ? 's' : ''}`
              : 'Roll back sessions'
          }
        >
          {isValid
            ? `Roll back ${sessionCount} session${sessionCount > 1 ? 's' : ''}`
            : 'No sessions to roll back'}
        </PrimaryPillButton>
      }
      cancel={{
        label: 'Cancel',
        onPress: onClose,
        variant: 'outlined',
        testID: 'rollback-cancel',
      }}
    >
      <RNText style={bodyTextStyle}>
        Deletes the last N sessions for a lift. Your cycle position and training max will revert to
        where they were before those sessions.
      </RNText>

      <View>
        <RNText style={labelStyle}>Lift</RNText>
        <View style={liftRowStyle}>
          {enabledLifts.map((lift) => (
            <Pressable
              key={lift}
              testID={`rollback-lift-${lift}`}
              onPress={() => setSelectedLift(lift)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selectedLift === lift }}
              style={makeLiftChipStyle(selectedLift === lift)}
            >
              <RNText style={makeLiftChipLabelStyle(selectedLift === lift)}>
                {liftDisplayName(lift)}
              </RNText>
            </Pressable>
          ))}
        </View>
      </View>

      <NumberStepper
        label="Sessions to remove"
        value={sessionCount}
        onChange={setSessionCount}
        min={1}
        max={Math.max(1, maxSessions)}
        testID="rollback-stepper"
        accessibilityLabelDecrement="Remove fewer sessions"
        accessibilityLabelIncrement="Remove more sessions"
      />

      {selectedLift && maxSessions === 0 && (
        <RNText style={bodyTextStyle}>No completed sessions for this lift.</RNText>
      )}
    </SheetLayout>
  );
}
