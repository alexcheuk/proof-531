import { LedgerRow, LedgerRowLabel, LedgerRowValue } from '@/design/primitives/LedgerRow';
import { LedgerSection } from '@/design/primitives/LedgerSection';

export function AboutSection() {
  return (
    <LedgerSection title="About">
      <LedgerRow first>
        <LedgerRowLabel primary="Program" secondary="Jim Wendler · 5/3/1 for beginners" />
        <LedgerRowValue value="v3.0" />
      </LedgerRow>
      <LedgerRow>
        <LedgerRowLabel primary="App version" secondary="531. ledger · paper-and-ink discipline" />
        <LedgerRowValue value="0.1.0" sub="alpha" />
      </LedgerRow>
    </LedgerSection>
  );
}
