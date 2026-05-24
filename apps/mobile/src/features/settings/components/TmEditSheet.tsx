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
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { NumberStepper } from '@/design/primitives/NumberStepper';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { SheetLayout } from '@/design/primitives/SheetLayout';
import type { Lift, Unit } from '@/domain/types';
import { displayUnit as displayUnitGlyph } from '@/domain/units';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { LIFT_META } from '../lifts';

/**
 * Format a percentage delta for the TmEditSheet caption.
 * Single-decimal under 10% (so 2.5%, 4.3% are legible); whole-number
 * above (a 12.7% jump rounds to 13% — no spurious precision).
 */
function formatDeltaPct(pct: number): string {
  const sign = pct > 0 ? '+' : '-';
  const abs = Math.abs(pct);
  return `${sign}${abs >= 10 ? abs.toFixed(0) : abs.toFixed(1)}%`;
}

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
  const [draft, setDraft] = useState<number>(currentValue);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = storageUnit === 'kg' ? 2.5 : 5;
  const captionVisible = storageUnit !== displayUnit;
  const delta = draft - currentValue;
  const isUnchanged = delta === 0;
  const isZero = draft <= 0;
  const saveDisabled = pending || isUnchanged || isZero;
  // Percent change of the delta vs the current TM. Surfaced so the user
  // can sanity-check the edit (Wendler's rule of thumb is +5 lb upper /
  // +10 lb lower per cycle — ≈ 2–5% jumps).
  const deltaPctLabel =
    currentValue > 0 && !isUnchanged ? formatDeltaPct((delta / currentValue) * 100) : null;

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
    } finally {
      // Reset on BOTH success and failure paths. Success previously
      // depended on onClose unmounting the sheet, which is brittle if the
      // parent state lags. Same pattern as useTodayScreenState +
      // useOnboardingFlow + useAmrapLogState in prior loops.
      setPending(false);
    }
  }

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
        <CapsLabel size="xs" color="ink3" style={{ letterSpacing: 1.26 }}>
          {`editing in ${displayUnitGlyph(storageUnit)} · displayed as ${displayUnitGlyph(displayUnit)}`}
        </CapsLabel>
      ) : null}

      <CapsLabel
        weight="semibold"
        color={isZero ? 'ink3' : 'ink1'}
        style={{ letterSpacing: 1.4 }}
        testID="tm-edit-delta"
      >
        {isZero
          ? 'Set a positive training max to continue'
          : isUnchanged
            ? 'No change from current'
            : `${delta > 0 ? '+' : ''}${delta} ${displayUnitGlyph(storageUnit)}${
                deltaPctLabel ? ` · ${deltaPctLabel}` : ''
              } from current`}
      </CapsLabel>

      {error ? (
        <CapsLabel weight="semibold" color="ink0" style={{ letterSpacing: 1.4 }}>
          {error}
        </CapsLabel>
      ) : null}
    </SheetLayout>
  );
}
