import { useDb } from '@/data/DbProvider';
import { setTrainingMax } from '@/data/accessors/trainingMax';
import { TM_KEY } from '@/data/queries/useLatestTm';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { Row } from '@/design/primitives/Row';
import { SheetLayout } from '@/design/primitives/SheetLayout';
import { useTheme } from '@/design/theme';
import type { TmAdjustmentSuggestion } from '@/domain/progression';
import type { Lift, Unit } from '@/domain/types';
import { convertWeight, displayUnit, round } from '@/domain/units';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';

export type TmApplySheetProps = {
  open: boolean;
  lift: Lift;
  suggestion: TmAdjustmentSuggestion;
  /** Current TM in display units. */
  tmDisplay: number;
  /** Display/render unit — the unit tmDisplay and suggestion.delta are expressed in. */
  unit: Unit;
  /** Storage unit — the unit written to the DB. */
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
  const { colors, spacing, type } = useTheme();
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
  const labelStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.ink3,
    marginBottom: 2,
  };
  const valueStyle: TextStyle = {
    fontFamily: `${type.sans}-Bold`,
    fontSize: 22,
    letterSpacing: -0.3,
    color: colors.ink0,
  };
  const arrowStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 18,
    color: colors.ink2,
    marginHorizontal: spacing.md,
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
            <RNText style={labelStyle}>Current TM</RNText>
            <RNText style={valueStyle} testID="tm-apply-current">
              {tmDisplay} {u}
            </RNText>
          </View>
          {suggestion.kind !== 'hold' ? (
            <>
              <RNText style={arrowStyle}>→</RNText>
              <View style={{ alignItems: 'flex-end' }}>
                <RNText style={labelStyle}>New TM</RNText>
                <RNText
                  style={[valueStyle, { color: colors.ink0 }]}
                  testID="tm-apply-new"
                >
                  {newTmDisplay} {u}
                </RNText>
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
