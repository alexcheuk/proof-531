import { LedgerRow, LedgerRowLabel, LedgerRowValue } from '@/design/primitives/LedgerRow';
import { LedgerSection } from '@/design/primitives/LedgerSection';

interface CycleRow {
  label: string;
  pct: string;
  reps: string;
}

const CYCLE_ROWS: readonly CycleRow[] = [
  { label: 'Week 1', pct: '65 · 75 · 85', reps: '5 / 5 / 5+' },
  { label: 'Week 2', pct: '70 · 80 · 90', reps: '3 / 3 / 3+' },
  { label: 'Week 3', pct: '75 · 85 · 95', reps: '5 / 3 / 1+' },
  { label: 'Week 4', pct: '40 · 50 · 60', reps: '5 / 5 / 5 · deload' },
];

export function CyclePrescriptionSection() {
  return (
    <LedgerSection title="Cycle prescription" hint="the original 5/3/1 · read only">
      {CYCLE_ROWS.map((w, i) => (
        <LedgerRow key={w.label} first={i === 0}>
          <LedgerRowLabel primary={w.label} secondary={w.reps} />
          <LedgerRowValue value={`${w.pct} %`} sub="TM %" numeric />
        </LedgerRow>
      ))}
    </LedgerSection>
  );
}
