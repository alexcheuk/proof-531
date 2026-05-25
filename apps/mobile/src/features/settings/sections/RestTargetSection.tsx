import { useDb } from '@/data/DbProvider';
import { updateSettings } from '@/data/accessors/settings';
import { SETTINGS_KEY } from '@/data/queries/useSettings';
import { LabeledSegRail } from '@/design/primitives/LabeledSegRail';
import { LedgerSection } from '@/design/primitives/LedgerSection';
import { SegRail } from '@/design/primitives/SegRail';
import { formatMmSs } from '@/domain/time';
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
  bbbRestTargetSeconds: number;
};

export function RestTargetSection({
  restTargetSeconds,
  bbbRestTargetSeconds,
}: RestTargetSectionProps) {
  const db = useDb();
  const queryClient = useQueryClient();
  const currentWorking = String(restTargetSeconds) as RestPreset;
  const currentBbb = String(bbbRestTargetSeconds) as RestPreset;

  async function commitRestTarget(next: RestPreset) {
    await updateSettings(db, { restTargetSeconds: Number(next) });
    await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
  }

  async function commitBbbRestTarget(next: RestPreset) {
    await updateSettings(db, { bbbRestTargetSeconds: Number(next) });
    await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
  }

  return (
    <LedgerSection title="Rest target" hint="countdown between sets">
      <LabeledSegRail
        label="Working sets"
        hint={`Currently ${formatMmSs(restTargetSeconds)} per set · 5/3/1 main work`}
      >
        <SegRail<RestPreset>
          testID="settings-rest-target"
          value={currentWorking}
          options={REST_PRESETS}
          onChange={(next) => void commitRestTarget(next)}
        />
      </LabeledSegRail>
      <LabeledSegRail
        label="BBB sets"
        hint={`Currently ${formatMmSs(bbbRestTargetSeconds)} per set · 5×10 @ 50%`}
      >
        <SegRail<RestPreset>
          testID="settings-bbb-rest-target"
          value={currentBbb}
          options={REST_PRESETS}
          onChange={(next) => void commitBbbRestTarget(next)}
        />
      </LabeledSegRail>
    </LedgerSection>
  );
}
