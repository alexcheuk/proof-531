import { useDb } from '@/data/DbProvider';
/**
 * Bottom-sheet TM editor. Tapping a Training max row in SettingsScreen opens
 * this sheet; Save appends a new TrainingMax row via `setTrainingMax` (PD-04
 * append-only contract — never UPDATE).
 *
 * Ported from `~/Development/531-pwa/src/features/settings/components/TmEditSheet.tsx`.
 * Visual fidelity to the PWA is approximated using the mobile design
 * primitives (Sheet + NumberStepper + PrimaryPillButton).
 */
import { setTrainingMax } from '@/data/accessors/trainingMax';
import { TM_KEY } from '@/data/queries/useLatestTm';
import { NumberStepper } from '@/design/primitives/NumberStepper';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { Sheet } from '@/design/primitives/Sheet';
import { useTheme } from '@/design/theme';
import type { Lift, Unit } from '@/domain/types';
import { displayUnit as displayUnitGlyph } from '@/domain/units';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
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
  const { colors, type, spacing } = useTheme();
  const [draft, setDraft] = useState<number>(currentValue);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edits commit in the storage unit (the row's own unit).
  const step = storageUnit === 'kg' ? 2.5 : 5;
  const captionVisible = storageUnit !== displayUnit;

  async function handleSave() {
    if (pending) return;
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

  const bodyStyle: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.bg2,
    gap: spacing.lg,
  };

  const eyebrowStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
    marginBottom: 6,
  };

  const titleStyle: TextStyle = {
    fontFamily: `${type.sans}-Bold`,
    fontSize: 22,
    letterSpacing: -0.66,
    color: colors.ink0,
  };

  const captionStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 9,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
    color: colors.ink3,
  };

  const errorStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.ink0,
  };

  const cancelStyle: ViewStyle = {
    paddingVertical: 16,
    alignItems: 'center',
  };

  const cancelLabelStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 11,
    letterSpacing: 2.42,
    textTransform: 'uppercase',
    color: pending ? colors.ink3 : colors.ink2,
  };

  return (
    <Sheet open onDismiss={onClose} testID="tm-edit-sheet">
      <View style={bodyStyle}>
        <View>
          <RNText style={eyebrowStyle}>Edit training max</RNText>
          <RNText style={titleStyle}>{LIFT_META[lift].label}</RNText>
        </View>

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
            editing in {displayUnitGlyph(storageUnit)} · displayed as{' '}
            {displayUnitGlyph(displayUnit)}
          </RNText>
        ) : null}

        {error ? <RNText style={errorStyle}>{error}</RNText> : null}

        <PrimaryPillButton
          testID="tm-edit-save"
          onPress={handleSave}
          disabled={pending}
          glyph={null}
        >
          Save
        </PrimaryPillButton>

        <Pressable
          testID="tm-edit-cancel"
          onPress={onClose}
          disabled={pending}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          style={cancelStyle}
        >
          <RNText style={cancelLabelStyle}>Cancel</RNText>
        </Pressable>
      </View>
    </Sheet>
  );
}
