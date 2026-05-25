import { LedgerRow, LedgerRowLabel, LedgerRowValue } from '@/design/primitives/LedgerRow';
import { LedgerSection } from '@/design/primitives/LedgerSection';
import Constants from 'expo-constants';

/**
 * Resolves the app version from the Expo config so this card never drifts
 * from `app.json`. Falls back to a static placeholder if the config isn't
 * available (shouldn't happen in normal runs).
 */
function getAppVersion(): string {
  return Constants.expoConfig?.version ?? '—';
}

export function AboutSection() {
  return (
    <LedgerSection title="About">
      <LedgerRow first>
        <LedgerRowLabel primary="Program" secondary="Jim Wendler · 5/3/1 for beginners" />
        <LedgerRowValue value="v3.0" />
      </LedgerRow>
      <LedgerRow>
        <LedgerRowLabel primary="App version" secondary="531. ledger · paper-and-ink discipline" />
        <LedgerRowValue value={getAppVersion()} />
      </LedgerRow>
    </LedgerSection>
  );
}
