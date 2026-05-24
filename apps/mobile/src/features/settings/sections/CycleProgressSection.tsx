import { CapsLabel } from '@/design/primitives/CapsLabel';
import { LedgerRow, LedgerRowLabel, LedgerRowValue } from '@/design/primitives/LedgerRow';
import { LedgerSection } from '@/design/primitives/LedgerSection';
import { useTheme } from '@/design/theme';
import type { Settings } from '@/domain/types';
import { View } from 'react-native';
import { CycleGridFrame } from '../../session/components/CycleGrid';
import { deriveCycleProgress } from '../cycleProgress';

export type CycleProgressSectionProps = {
  settings: Settings;
};

/**
 * Read-only "where you are in the cycle" marker on Settings.
 *
 *   - Ledger row showing `Cycle NN` + day-of-cycle position.
 *   - Visual 16-cell grid (`CycleGridFrame`) below, mirroring the
 *     SessionComplete cycle viz so the user sees the same shape in both
 *     surfaces.
 *   - Deload-week footnote when on week 4.
 *
 * Pure derivation off `settings.week` + `enabledLifts.length`.
 */
export function CycleProgressSection({ settings }: CycleProgressSectionProps) {
  const { spacing } = useTheme();
  const progress = deriveCycleProgress(settings.week, settings.enabledLifts.length);
  const isDeload = settings.week === 4;

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
      <View style={{ marginTop: spacing.md, marginLeft: -24, marginRight: -24 }}>
        <CycleGridFrame
          completedThisCycle={progress.dayOfCycle}
          sessionsInCycle={progress.totalDays}
          testID="settings-cycle-grid"
        />
      </View>
      {isDeload ? (
        <View
          style={{ paddingTop: spacing.sm, paddingHorizontal: spacing.xs }}
          testID="settings-cycle-deload-hint"
        >
          <CapsLabel size="xs" color="ink3" style={{ lineHeight: 16 }}>
            Deload week · 40/50/60% sets to recover. Next cycle starts after week 4 finishes.
          </CapsLabel>
        </View>
      ) : null}
    </LedgerSection>
  );
}
