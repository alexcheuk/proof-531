import { LedgerRow, LedgerRowLabel, LedgerRowValue } from '@/design/primitives/LedgerRow';
import { LedgerSection } from '@/design/primitives/LedgerSection';

interface CycleRow {
  label: string;
  pct: string;
  reps: string;
}

const CYCLE_ROWS: readonly CycleRow[] = [
  { label: 'Day 1', pct: '65 · 75 · 85', reps: '5 / 5 / 5+' },
  { label: 'Day 2', pct: '70 · 80 · 90', reps: '3 / 3 / 3+' },
  { label: 'Day 3', pct: '75 · 85 · 95', reps: '5 / 3 / 1+' },
  // Day 4 is the 7th-Week-Protocol TM test (replaces the classic Wendler
  // deload). Single set at 100% TM with a 3–5 rep target. See
  // `_workspace/01_design_spec.md`.
  { label: 'Day 4', pct: '100', reps: 'TM × 3–5 · test' },
];

export function CyclePrescriptionSection() {
  return (
    <LedgerSection title="Cycle prescription" hint="5/3/1 · week 4 verifies the TM · read only">
      {CYCLE_ROWS.map((w, i) => (
        <LedgerRow key={w.label} first={i === 0}>
          <LedgerRowLabel primary={w.label} secondary={w.reps} />
          <LedgerRowValue value={`${w.pct} %`} sub="TM %" numeric />
        </LedgerRow>
      ))}
    </LedgerSection>
  );
}
