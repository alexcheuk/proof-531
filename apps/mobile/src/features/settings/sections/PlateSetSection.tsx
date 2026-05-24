import { useDb } from '@/data/DbProvider';
import { updateSettings } from '@/data/accessors/settings';
import { SETTINGS_KEY } from '@/data/queries/useSettings';
import { LedgerSection } from '@/design/primitives/LedgerSection';
import { SegRail } from '@/design/primitives/SegRail';
import type { Settings } from '@/domain/types';
import { useQueryClient } from '@tanstack/react-query';
import { type PlateSetUi, schemaToUiPlateSet, uiToSchemaPlateSet } from '../plateSetMapping';

const PLATE_OPTIONS = [
  { value: 'standard' as const, label: 'lb plates' },
  { value: 'metric' as const, label: 'kg plates' },
  { value: 'custom' as const, label: 'Custom', disabled: true },
];

export type PlateSetSectionProps = {
  plateSet: Settings['plateSet'];
};

export function PlateSetSection({ plateSet }: PlateSetSectionProps) {
  const db = useDb();
  const queryClient = useQueryClient();
  const uiPlateSet: PlateSetUi = schemaToUiPlateSet(plateSet);

  async function commitPlateSet(next: PlateSetUi) {
    const schemaValue = uiToSchemaPlateSet(next);
    if (schemaValue == null) return;
    await updateSettings(db, { plateSet: schemaValue });
    await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
  }

  return (
    <LedgerSection title="Plate set">
      <SegRail
        testID="settings-plate-set"
        value={uiPlateSet}
        options={PLATE_OPTIONS}
        onChange={(next) => void commitPlateSet(next)}
      />
    </LedgerSection>
  );
}
