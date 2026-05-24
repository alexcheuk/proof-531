import { CapsLabel } from '@/design/primitives/CapsLabel';
import { LedgerRow, LedgerRowLabel, LedgerRowValue } from '@/design/primitives/LedgerRow';
import { LedgerSection } from '@/design/primitives/LedgerSection';
import { useTheme } from '@/design/theme';
import type { Settings } from '@/domain/types';
import { View } from 'react-native';
import { deriveCycleProgress } from '../cycleProgress';

export type CycleProgressSectionProps = {
  settings: Settings;
};

/**
 * Read-only "where you are in the cycle" marker on Settings. Renders a
 * single ledger row: `Cycle NN` on the left, `day N of M` on the right,
 * with a "Deload week" or "N weeks until deload" hint as the secondary
 * caption. When the user has rolled into week 4 (deload), an extra
 * contextual nudge appears below the row explaining the lighter loads.
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
