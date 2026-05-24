import { useDb } from '@/data/DbProvider';
/**
 * Bottom-sheet TM editor. Tapping a Training max row in SettingsScreen opens
 * this sheet; Save appends a new TrainingMax row via `setTrainingMax` (PD-04
 * append-only contract — never UPDATE).
 *
 * Ported from `~/Development/531-pwa/src/features/settings/components/TmEditSheet.tsx`.
 */
import { setTrainingMax } from '@/data/accessors/trainingMax';
import { TM_KEY } from '@/data/queries/useLatestTm';
import { NumberStepper } from '@/design/primitives/NumberStepper';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { SheetLayout } from '@/design/primitives/SheetLayout';
import { useTheme } from '@/design/theme';
import type { Lift, Unit } from '@/domain/types';
import { displayUnit as displayUnitGlyph } from '@/domain/units';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Text as RNText, type TextStyle } from 'react-native';
import { LIFT_META } from '../lifts';

export interface TmEditSheetProps {
  lift: Lift;
  currentValue: number;
  /**
   * Storage unit — the TM row's own unit. Edits commit in this unit so the
   * NumberStepper step and unit glyph are storage-side.
   */
  storageUnit: Unit;
  /** Settings.displayUnit — used only for the storage ≠ display caption. */
  displayUnit: Unit;
  onClose: () => void;
}

export function TmEditSheet({
  lift,
  currentValue,
  storageUnit,
  displayUnit,
  onClose,
}: TmEditSheetProps) {
  const db = useDb();
  const queryClient = useQueryClient();
  const { colors, type } = useTheme();
  const [draft, setDraft] = useState<number>(currentValue);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = storageUnit === 'kg' ? 2.5 : 5;
  const captionVisible = storageUnit !== displayUnit;
  const delta = draft - currentValue;
  const isUnchanged = delta === 0;
  const isZero = draft <= 0;
  const saveDisabled = pending || isUnchanged || isZero;

  async function handleSave() {
    if (saveDisabled) return;
    setPending(true);
    setError(null);
    try {
      await setTrainingMax(db, lift, draft, storageUnit);
      await queryClient.invalidateQueries({ queryKey: TM_KEY });
      onClose();
    } catch (err) {
      console.error('TmEditSheet.handleSave setTrainingMax failed', err);
      setError('Could not save · try again');
      setPending(false);
    }
  }

  const captionStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 9,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
    color: colors.ink3,
  };

  const deltaStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: isZero ? colors.ink3 : colors.ink1,
  };

  const errorStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.ink0,
  };

  return (
    <SheetLayout
      open
      onDismiss={onClose}
      testID="tm-edit-sheet"
      eyebrow="Edit training max"
      title={LIFT_META[lift].label}
      titleVariant="compact"
      pending={pending}
      primary={
        <PrimaryPillButton
          testID="tm-edit-save"
          onPress={handleSave}
          disabled={saveDisabled}
          glyph={null}
        >
          Save
        </PrimaryPillButton>
      }
      cancel={{
        label: 'Cancel',
        onPress: onClose,
        variant: 'text',
        testID: 'tm-edit-cancel',
      }}
    >
      <NumberStepper
        testID="tm-edit-stepper"
        label="Training max"
        value={draft}
        unit={storageUnit}
        step={step}
        min={0}
        onChange={setDraft}
      />

      {captionVisible ? (
        <RNText style={captionStyle}>
          editing in {displayUnitGlyph(storageUnit)} · displayed as {displayUnitGlyph(displayUnit)}
        </RNText>
      ) : null}

      <RNText style={deltaStyle} testID="tm-edit-delta">
        {isZero
          ? 'Set a positive training max to continue'
          : isUnchanged
            ? 'No change from current'
            : `${delta > 0 ? '+' : ''}${delta} ${displayUnitGlyph(storageUnit)} from current`}
      </RNText>

      {error ? <RNText style={errorStyle}>{error}</RNText> : null}
    </SheetLayout>
  );
}
