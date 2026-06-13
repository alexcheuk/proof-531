import { useDb } from '@/data/DbProvider';
import { setTrainingMax } from '@/data/accessors/trainingMax';
import { TM_KEY } from '@/data/queries/useLatestTm';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { Row } from '@/design/primitives/Row';
import { SheetLayout } from '@/design/primitives/SheetLayout';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { TmAdjustmentSuggestion } from '@/domain/progression';
import type { Lift, Unit } from '@/domain/types';
import { convertWeight, displayUnit, round } from '@/domain/units';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { View, type ViewStyle } from 'react-native';

export type TmApplySheetProps = {
  open: boolean;
  lift: Lift;
  suggestion: TmAdjustmentSuggestion;
  /** Current TM in display units. */
  tmDisplay: number;
  /** Display/render unit  -  the unit tmDisplay and suggestion.delta are expressed in. */
  unit: Unit;
  /** Storage unit  -  the unit written to the DB. */
  storageUnit: Unit;
  onClose: () => void;
};

export function TmApplySheet({
  open,
  lift,
  suggestion,
  tmDisplay,
  unit,
  storageUnit,
  onClose,
}: TmApplySheetProps) {
  const db = useDb();
  const queryClient = useQueryClient();
  const { colors, spacing } = useTheme();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const u = displayUnit(unit);

  const { title, newTmDisplay, actionLabel } = useMemo(() => {
    if (suggestion.kind === 'increment') {
      return {
        title: 'Increase TM',
        newTmDisplay: tmDisplay + suggestion.delta,
        actionLabel: 'Apply',
      };
    }
    if (suggestion.kind === 'reset') {
      return {
        title: 'Reset TM',
        newTmDisplay: round(tmDisplay * suggestion.resetPct, unit),
        actionLabel: 'Apply',
      };
    }
    return { title: 'TM is Honest', newTmDisplay: tmDisplay, actionLabel: 'Got it' };
  }, [suggestion, tmDisplay, unit]);

  async function handleApply() {
    if (suggestion.kind === 'hold') {
      onClose();
      return;
    }
    setPending(true);
    setError(null);
    try {
      const newTmStorage = round(convertWeight(newTmDisplay, unit, storageUnit), storageUnit);
      await setTrainingMax(db, lift, newTmStorage, storageUnit);
      await queryClient.invalidateQueries({ queryKey: TM_KEY });
      onClose();
    } catch {
      setError('Could not apply · try again');
    } finally {
      setPending(false);
    }
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
      testID="tm-apply-sheet"
      eyebrow="Apply suggestion"
      title={title}
      primary={
        <PrimaryPillButton
          testID="tm-apply-confirm"
          onPress={handleApply}
          disabled={pending}
          glyph={null}
        >
          {actionLabel}
        </PrimaryPillButton>
      }
      cancel={{
        label: suggestion.kind === 'hold' ? 'Close' : 'Not now',
        onPress: onClose,
        variant: 'text',
        testID: 'tm-apply-cancel',
      }}
      pending={pending}
    >
      <View style={rowStyle}>
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
              testID="tm-apply-current"
            >
              {tmDisplay} {u}
            </Text>
          </View>
          {suggestion.kind !== 'hold' ? (
            <>
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
                  testID="tm-apply-new"
                >
                  {newTmDisplay} {u}
                </Text>
              </View>
            </>
          ) : (
            <CapsLabel size="xs" color="ink2">
              No change · TM is honest
            </CapsLabel>
          )}
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
