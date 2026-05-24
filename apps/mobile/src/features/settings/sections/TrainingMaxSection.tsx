import { LedgerRow, LedgerRowLabel, LedgerRowValue } from '@/design/primitives/LedgerRow';
import { LedgerSection } from '@/design/primitives/LedgerSection';
import { formatRelativeTime } from '@/domain/relativeTime';
import type { Lift, Settings, Unit } from '@/domain/types';
import { displayUnit as displayUnitGlyph } from '@/domain/units';
import type { useSettingsScreenData } from '../hooks/useSettingsScreenData';
import { LIFT_META } from '../lifts';

type TmsByLift = ReturnType<typeof useSettingsScreenData>['tmsByLift'];

export type TrainingMaxSectionProps = {
  settings: Settings;
  tmsByLift: TmsByLift;
  onEdit: (lift: Lift) => void;
};

export function TrainingMaxSection({ settings, tmsByLift, onEdit }: TrainingMaxSectionProps) {
  return (
    <LedgerSection title="Training max" hint="90% of 1rm · adjust as you bump cycles">
      {settings.enabledLifts.map((lift, i) => {
        const tm = tmsByLift?.[lift];
        const value = tm?.value ?? 0;
        // Render the unit from the TM row itself, not from settings.unit, so
        // the historical write's interpretation is preserved across a
        // display-unit flip.
        const tmUnit: Unit = tm?.unit ?? settings.storageUnit;
        const updatedLabel = tm?.updatedAt
          ? `updated ${formatRelativeTime(tm.updatedAt)}`
          : 'not set';
        return (
          <LedgerRow
            key={lift}
            first={i === 0}
            onPress={() => onEdit(lift)}
            testID={`settings-tm-row-${lift}`}
          >
            <LedgerRowLabel primary={LIFT_META[lift].label} secondary={updatedLabel} />
            <LedgerRowValue value={`${value} ${displayUnitGlyph(tmUnit)}  ›`} numeric />
          </LedgerRow>
        );
      })}
    </LedgerSection>
  );
}
