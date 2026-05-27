import { CheckboxLedger } from '@/design/primitives/CheckboxLedger';
import { LedgerRow, LedgerRowLabel } from '@/design/primitives/LedgerRow';
import { LedgerSection } from '@/design/primitives/LedgerSection';
import { LOWER_BODY, tmIncrement } from '@/domain/increments';
import type { Lift, Unit } from '@/domain/types';
import { displayUnit as displayUnitGlyph } from '@/domain/units';
import { useToggleLift } from '../hooks/useToggleLift';
import { LIFT_META, LIFT_ORDER } from '../lifts';

export type ActiveLiftsSectionProps = {
  enabled: Lift[];
  storageUnit: Unit;
};

export function ActiveLiftsSection({ enabled, storageUnit }: ActiveLiftsSectionProps) {
  const hint = `${enabled.length} of 4 · ${enabled.length * 4} sessions per cycle`;
  const toggle = useToggleLift();

  return (
    <LedgerSection title="Active lifts" hint={hint}>
      {LIFT_ORDER.map((lift, i) => {
        const isOn = enabled.includes(lift);
        const isLastEnabled = isOn && enabled.length === 1;
        const isLower = LOWER_BODY.has(lift);
        const bump = tmIncrement(storageUnit, lift);
        const secondary = isLower
          ? `+${bump} ${displayUnitGlyph(storageUnit)} / cycle · lower body`
          : `+${bump} ${displayUnitGlyph(storageUnit)} / cycle · upper body`;
        return (
          <LedgerRow
            key={lift}
            first={i === 0}
            disabled={isLastEnabled}
            onPress={() => void toggle(lift)}
            testID={`settings-lift-toggle-${lift}`}
          >
            <LedgerRowLabel primary={LIFT_META[lift].label} secondary={secondary} />
            <CheckboxLedger
              checked={isOn}
              disabled={isLastEnabled}
              testID={`settings-lift-checkbox-${lift}`}
            />
          </LedgerRow>
        );
      })}
    </LedgerSection>
  );
}
