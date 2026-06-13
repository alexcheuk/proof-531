import { useApplyMissReset } from '@/data/queries/useApplyMissReset';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { Row } from '@/design/primitives/Row';
import { SheetLayout } from '@/design/primitives/SheetLayout';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { missResetTm } from '@/domain/progression';
import type { Lift, Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { View, type ViewStyle } from 'react-native';

export type MissResetSheetProps = {
  open: boolean;
  lift: Lift;
  /** Current TM in display units, drives the Current TM readout and the target. */
  tmDisplay: number;
  /** Display/render unit. */
  unit: Unit;
  onClose: () => void;
};

export function MissResetSheet({ open, lift, tmDisplay, unit, onClose }: MissResetSheetProps) {
  const { colors, spacing } = useTheme();
  const applyReset = useApplyMissReset();
  const [error, setError] = useState<string | null>(null);

  const u = displayUnit(unit);
  const newTmDisplay = missResetTm(tmDisplay, unit);
  const pending = applyReset.isPending;

  function handleApply() {
    setError(null);
    applyReset.mutate(
      { lift },
      {
        onSuccess: () => {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onClose();
        },
        onError: () => {
          setError('Could not apply · try again');
        },
      },
    );
  }

  const rowStyle: ViewStyle = {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    marginBottom: spacing.md,
  };

  return (
    <SheetLayout
      open={open}
      onDismiss={onClose}
      testID="miss-reset-sheet"
      eyebrow="Apply correction"
      title="Reset TM"
      primary={
        <PrimaryPillButton
          testID="miss-reset-confirm"
          onPress={handleApply}
          disabled={pending}
          glyph={null}
          accessibilityLabel={`Apply reset, set training max to ${newTmDisplay} ${u}`}
        >
          Apply
        </PrimaryPillButton>
      }
      cancel={{
        label: 'Not now',
        onPress: onClose,
        variant: 'text',
        testID: 'miss-reset-cancel',
        accessibilityLabel: 'Not now, keep current training max',
      }}
      pending={pending}
    >
      <View
        style={rowStyle}
        accessible
        accessibilityLabel={`Current training max ${tmDisplay} ${u}, new training max ${newTmDisplay} ${u}`}
      >
        <Row justify="space-between" align="center">
          <View>
            <CapsLabel size="sm" color="ink3" style={{ marginBottom: 2 }}>
              Current TM
            </CapsLabel>
            <Text
              variant="sans"
              weight="bold"
              size={22}
              color="ink0"
              style={{ letterSpacing: -0.3 }}
              testID="miss-reset-current"
            >
              {tmDisplay} {u}
            </Text>
          </View>
          <Text
            variant="mono"
            weight="semibold"
            size={18}
            color="ink2"
            style={{ marginHorizontal: spacing.md }}
          >
            →
          </Text>
          <View style={{ alignItems: 'flex-end' }}>
            <CapsLabel size="sm" color="ink3" style={{ marginBottom: 2 }}>
              New TM
            </CapsLabel>
            <Text
              variant="sans"
              weight="bold"
              size={22}
              color="ink0"
              style={{ letterSpacing: -0.3 }}
              testID="miss-reset-new"
            >
              {newTmDisplay} {u}
            </Text>
          </View>
        </Row>
      </View>

      {error ? (
        <CapsLabel weight="semibold" color="ink0" style={{ letterSpacing: 1.4 }}>
          {error}
        </CapsLabel>
      ) : null}
    </SheetLayout>
  );
}
