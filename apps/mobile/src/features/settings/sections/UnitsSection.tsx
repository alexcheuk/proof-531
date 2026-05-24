import { useDb } from '@/data/DbProvider';
import { setDisplayUnit } from '@/data/accessors/settings';
import { SETTINGS_KEY } from '@/data/queries/useSettings';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { LedgerSection } from '@/design/primitives/LedgerSection';
import { SegRail } from '@/design/primitives/SegRail';
import { useTheme } from '@/design/theme';
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
  const { spacing } = useTheme();

  async function commitDisplayUnit(next: Unit) {
    await setDisplayUnit(db, next);
    await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
  }

  return (
    <LedgerSection title="Units" hint="storage · display">
      <CapsLabel
        size="xs"
        weight="semibold"
        style={{ marginTop: spacing.md, marginBottom: spacing.sm }}
      >
        Training unit
      </CapsLabel>
      <SegRail
        testID="settings-storage-unit"
        value={storageUnit}
        options={UNIT_OPTIONS}
        onChange={(next) => onStorageRequest(next)}
      />
      <CapsLabel size="xs" color="ink3" style={{ marginTop: spacing.sm }}>
        flipping converts your training maxes
      </CapsLabel>

      <CapsLabel
        size="xs"
        weight="semibold"
        style={{ marginTop: spacing.md, marginBottom: spacing.sm }}
      >
        Display unit
      </CapsLabel>
      <SegRail
        testID="settings-display-unit"
        value={displayUnit}
        options={UNIT_OPTIONS}
        onChange={(next) => void commitDisplayUnit(next)}
      />
      <CapsLabel size="xs" color="ink3" style={{ marginTop: spacing.sm }}>
        changes how weights are shown · no data change
      </CapsLabel>
    </LedgerSection>
  );
}
