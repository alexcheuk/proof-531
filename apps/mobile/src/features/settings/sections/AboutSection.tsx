import { LedgerRow, LedgerRowLabel, LedgerRowValue } from '@/design/primitives/LedgerRow';
import { LedgerSection } from '@/design/primitives/LedgerSection';
import Constants from 'expo-constants';

function getAppVersion(): string {
  return Constants.expoConfig?.version ?? '--';
}

export function AboutSection() {
  return (
    <LedgerSection title="About">
      <LedgerRow first>
        <LedgerRowLabel primary="Program" secondary="Jim Wendler · 5/3/1 + BBB" />
        <LedgerRowValue value="v3.0" />
      </LedgerRow>
      <LedgerRow>
        <LedgerRowLabel primary="App version" secondary="531. ledger · paper-and-ink discipline" />
        <LedgerRowValue value={getAppVersion()} />
      </LedgerRow>
    </LedgerSection>
  );
}
