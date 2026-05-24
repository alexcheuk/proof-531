import { LedgerRow, LedgerRowLabel, LedgerRowValue } from '@/design/primitives/LedgerRow';
import { LedgerSection } from '@/design/primitives/LedgerSection';
import type { Settings } from '@/domain/types';
import { deriveCycleProgress } from '../cycleProgress';

export type CycleProgressSectionProps = {
  settings: Settings;
};

/**
 * Read-only "where you are in the cycle" marker on Settings. Renders a
 * single ledger row: `Cycle NN` on the left, `day N of M` on the right,
 * with a "Deload week" or "N weeks until deload" hint as the secondary
 * caption. Pure derivation off `settings.week` + `enabledLifts.length`.
 */
export function CycleProgressSection({ settings }: CycleProgressSectionProps) {
  const progress = deriveCycleProgress(settings.week, settings.enabledLifts.length);

  return (
    <LedgerSection title="Cycle progress" hint={`week ${settings.week} of 4`}>
      <LedgerRow first testID="settings-cycle-progress-row">
        <LedgerRowLabel
          primary={`Cycle ${String(settings.currentCycle).padStart(2, '0')}`}
          secondary={progress.caption}
        />
        <LedgerRowValue
          value={`${progress.dayOfCycle} of ${progress.totalDays}`}
          sub="days"
          numeric
        />
      </LedgerRow>
    </LedgerSection>
  );
}
