import { useDb } from '@/data/DbProvider';
import { updateSettings } from '@/data/accessors/settings';
import { SETTINGS_KEY } from '@/data/queries/useSettings';
import { LedgerSection } from '@/design/primitives/LedgerSection';
import { SegRail } from '@/design/primitives/SegRail';
import { useQueryClient } from '@tanstack/react-query';

type RestPreset = '60' | '90' | '120' | '180' | '240';

const REST_PRESETS: ReadonlyArray<{ value: RestPreset; label: string }> = [
  { value: '60', label: '1m' },
  { value: '90', label: '1:30' },
  { value: '120', label: '2m' },
  { value: '180', label: '3m' },
  { value: '240', label: '4m' },
];

export type RestTargetSectionProps = {
  restTargetSeconds: number;
};

export function RestTargetSection({ restTargetSeconds }: RestTargetSectionProps) {
  const db = useDb();
  const queryClient = useQueryClient();
  const current = String(restTargetSeconds) as RestPreset;

  async function commitRestTarget(next: RestPreset) {
    await updateSettings(db, { restTargetSeconds: Number(next) });
    await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
  }

  return (
    <LedgerSection title="Rest target" hint="countdown between working sets">
      <SegRail<RestPreset>
        testID="settings-rest-target"
        value={current}
        options={REST_PRESETS}
        onChange={(next) => void commitRestTarget(next)}
      />
    </LedgerSection>
  );
}
