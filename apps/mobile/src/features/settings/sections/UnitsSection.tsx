import { useDb } from '@/data/DbProvider';
import { setDisplayUnit } from '@/data/accessors/settings';
import { SETTINGS_KEY } from '@/data/queries/useSettings';
import { LedgerSection } from '@/design/primitives/LedgerSection';
import { SegRail } from '@/design/primitives/SegRail';
import { useTheme } from '@/design/theme';
import type { Unit } from '@/domain/types';
import { useQueryClient } from '@tanstack/react-query';
import { Text as RNText, type TextStyle } from 'react-native';

const UNIT_OPTIONS = [
  { value: 'lbs' as const, label: 'Pounds · lb' },
  { value: 'kg' as const, label: 'Kilograms · kg' },
];

export type UnitsSectionProps = {
  storageUnit: Unit;
  displayUnit: Unit;
  onStorageRequest: (next: Unit) => void;
};

export function UnitsSection({ storageUnit, displayUnit, onStorageRequest }: UnitsSectionProps) {
  const db = useDb();
  const queryClient = useQueryClient();
  const { colors, type, spacing } = useTheme();

  const subLabelStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 9,
    letterSpacing: 1.98,
    textTransform: 'uppercase',
    color: colors.ink2,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  };

  const captionStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 9,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
    color: colors.ink3,
    marginTop: spacing.sm,
  };

  async function commitDisplayUnit(next: Unit) {
    await setDisplayUnit(db, next);
    await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
  }

  return (
    <LedgerSection title="Units" hint="storage · display">
      <RNText style={subLabelStyle}>Training unit</RNText>
      <SegRail
        testID="settings-storage-unit"
        value={storageUnit}
        options={UNIT_OPTIONS}
        onChange={(next) => onStorageRequest(next)}
      />
      <RNText style={captionStyle}>flipping converts your training maxes</RNText>

      <RNText style={subLabelStyle}>Display unit</RNText>
      <SegRail
        testID="settings-display-unit"
        value={displayUnit}
        options={UNIT_OPTIONS}
        onChange={(next) => void commitDisplayUnit(next)}
      />
      <RNText style={captionStyle}>changes how weights are shown · no data change</RNText>
    </LedgerSection>
  );
}
