import { LedgerRow, LedgerRowLabel, LedgerRowValue } from '@/design/primitives/LedgerRow';
import { LedgerSection } from '@/design/primitives/LedgerSection';
import { LOWER_BODY, tmIncrement } from '@/domain/increments';
import type { Unit } from '@/domain/types';
import { displayUnit as displayUnitGlyph } from '@/domain/units';
import { LIFT_META, LIFT_ORDER } from '../lifts';

export type ProgressionRulesSectionProps = {
  storageUnit: Unit;
};

export function ProgressionRulesSection({ storageUnit }: ProgressionRulesSectionProps) {
  const glyph = displayUnitGlyph(storageUnit);
  return (
    <LedgerSection title="Progression rules" hint="per cycle bump">
      {LIFT_ORDER.map((lift, i) => {
        const isLower = LOWER_BODY.has(lift);
        const bump = tmIncrement(storageUnit, lift);
        return (
          <LedgerRow key={lift} first={i === 0}>
            <LedgerRowLabel
              primary={LIFT_META[lift].label}
              secondary={isLower ? 'lower body' : 'upper body'}
            />
            <LedgerRowValue value={`+${bump} ${glyph}`} sub="per cycle" />
          </LedgerRow>
        );
      })}
    </LedgerSection>
  );
}
