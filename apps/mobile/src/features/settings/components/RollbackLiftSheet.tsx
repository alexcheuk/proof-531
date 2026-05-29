import { useDb } from '@/data/DbProvider';
import { countCompletedSessionsForLift } from '@/data/accessors/rollbackLift';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { NumberStepper } from '@/design/primitives/NumberStepper';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { SheetLayout } from '@/design/primitives/SheetLayout';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { liftDisplayName } from '@/domain/labels';
import type { Lift } from '@/domain/types';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';

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
  const { colors, spacing } = useTheme();
  const db = useDb();
  const [selectedLift, setSelectedLift] = useState<Lift | null>(enabledLifts[0] ?? null);
  const [sessionCount, setSessionCount] = useState(1);

  const { data: maxSessions = 0 } = useQuery({
    queryKey: ['rollback-count', selectedLift],
    queryFn: () =>
      selectedLift ? countCompletedSessionsForLift(db, selectedLift) : Promise.resolve(0),
    enabled: open && selectedLift != null,
  });

  // Reset to 1 when the sheet opens, so a second open doesn't carry over the
  // user's last stepper value from a session that may have been deleted.
  useEffect(() => {
    if (open) setSessionCount(1);
  }, [open]);

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
      <Text variant="sans" weight="regular" size={13} color="ink2" style={{ lineHeight: 19 }}>
        Deletes the last N sessions for a lift. Your cycle position and training max will revert to
        where they were before those sessions.
      </Text>

      <View>
        <CapsLabel size="md" weight="semibold" color="ink3" style={{ marginBottom: spacing.xs }}>
          Lift
        </CapsLabel>
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
              <Text
                variant="sans"
                weight="medium"
                size={13}
                color={selectedLift === lift ? 'bg0' : 'ink2'}
              >
                {liftDisplayName(lift)}
              </Text>
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
        <Text variant="sans" weight="regular" size={13} color="ink2" style={{ lineHeight: 19 }}>
          No completed sessions for this lift.
        </Text>
      )}
    </SheetLayout>
  );
}
