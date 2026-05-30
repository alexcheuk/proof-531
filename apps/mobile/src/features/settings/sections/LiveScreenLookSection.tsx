import { LedgerSection } from '@/design/primitives/LedgerSection';
import { SegRail } from '@/design/primitives/SegRail';
import { useUpdateSettings } from '../hooks/useUpdateSettings';

type LookValue = 'paper' | 'inverted';

const LOOK_OPTIONS: ReadonlyArray<{ value: LookValue; label: string }> = [
  { value: 'paper', label: 'Paper' },
  { value: 'inverted', label: 'Inverted' },
];

export type LiveScreenLookSectionProps = {
  /** Persisted setting. `false` → paper, `true` → inverted. */
  inverted: boolean;
};

export function LiveScreenLookSection({ inverted }: LiveScreenLookSectionProps) {
  const updateSettings = useUpdateSettings();
  const value: LookValue = inverted ? 'inverted' : 'paper';

  async function commit(next: LookValue) {
    await updateSettings({ liveScreenInverted: next === 'inverted' });
  }

  return (
    <LedgerSection title="Live screen look" hint="set + rest surface during the lift">
      <SegRail<LookValue>
        testID="settings-live-screen-look"
        value={value}
        options={LOOK_OPTIONS}
        onChange={(next) => void commit(next)}
      />
    </LedgerSection>
  );
}
