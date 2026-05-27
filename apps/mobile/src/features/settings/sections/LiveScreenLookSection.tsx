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

/**
 * Toggles the visual treatment of the Live set + rest screens between
 * the default paper canvas and the inverted (ink-0 surface, paper text)
 * palette used by the PR celebration screen. Discord 1508984314.
 */
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
