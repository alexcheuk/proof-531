import { useDb } from '@/data/DbProvider';
import { setDisplayUnit } from '@/data/accessors/settings';
import { SETTINGS_KEY } from '@/data/queries/useSettings';
import { LabeledSegRail } from '@/design/primitives/LabeledSegRail';
import { LedgerSection } from '@/design/primitives/LedgerSection';
import { SegRail } from '@/design/primitives/SegRail';
import type { Unit } from '@/domain/types';
import { useQueryClient } from '@tanstack/react-query';

const UNIT_OPTIONS = [
  { value: 'lbs' as const, label: 'Pounds · lb' },
  { value: 'kg' as const, label: 'Kilograms · kg' },
];

export type UnitsSectionProps = {
  storageUnit: Unit;
  displayUnit: Unit;
  onStorageRequest: (next: Unit) => void;
};

export function UnitsSection({ storageUnit, displayUnit, onStorageRequest }: UnitsSectionProps) {
  const db = useDb();
  const queryClient = useQueryClient();

  async function commitDisplayUnit(next: Unit) {
    await setDisplayUnit(db, next);
    await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
  }

  return (
    <LedgerSection title="Units" hint="storage · display">
      <LabeledSegRail label="Training unit" hint="flipping converts your training maxes">
        <SegRail
          testID="settings-storage-unit"
          value={storageUnit}
          options={UNIT_OPTIONS}
          onChange={(next) => onStorageRequest(next)}
        />
      </LabeledSegRail>
      <LabeledSegRail label="Display unit" hint="changes how weights are shown · no data change">
        <SegRail
          testID="settings-display-unit"
          value={displayUnit}
          options={UNIT_OPTIONS}
          onChange={(next) => void commitDisplayUnit(next)}
        />
      </LabeledSegRail>
    </LedgerSection>
  );
}
