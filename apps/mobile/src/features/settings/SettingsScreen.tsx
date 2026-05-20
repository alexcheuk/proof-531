import { SegRail } from '@/design/primitives/SegRail';
import { Text } from '@/design/primitives/Text';
import { colors, shape } from '@/design/tokens';
import { ScrollView, Switch, View } from 'react-native';
import { SettingRow } from './SettingRow';
import { SettingsSection } from './SettingsSection';

export type PlateSet = 'standard-lbs' | 'standard-kg' | 'custom';

export type SettingsScreenLift = {
  id: string;
  label: string;
  enabled: boolean;
};

export type SettingsScreenProps = {
  unit: 'lbs' | 'kg';
  onUnitChange: (u: 'lbs' | 'kg') => void;
  plateSet: PlateSet;
  onPlateSetChange: (p: PlateSet) => void;
  lifts: SettingsScreenLift[];
  onToggleLift: (id: string) => void;
  analyticsEnabled: boolean;
  onAnalyticsChange: (v: boolean) => void;
};

const PLATE_SET_LABEL: Record<PlateSet, string> = {
  'standard-lbs': 'Standard (lbs)',
  'standard-kg': 'Standard (kg)',
  custom: 'Custom',
};

export function SettingsScreen({
  unit,
  onUnitChange,
  plateSet,
  onPlateSetChange,
  lifts,
  onToggleLift,
  analyticsEnabled,
  onAnalyticsChange,
}: SettingsScreenProps) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg0 }}
      contentContainerStyle={{ padding: shape.rLg, gap: shape.rLg }}
      testID="settings-screen"
    >
      <Text variant="title">Settings</Text>

      <SettingsSection title="Units" testID="settings-section-units">
        <SettingRow
          label="Weight unit"
          trailing={
            <SegRail
              testID="settings-unit"
              options={[
                { value: 'lbs', label: 'lbs' },
                { value: 'kg', label: 'kg' },
              ]}
              value={unit}
              onChange={onUnitChange}
            />
          }
        />
      </SettingsSection>

      <SettingsSection title="Plate set" testID="settings-section-plates">
        <SettingRow
          label="Active plate set"
          value={PLATE_SET_LABEL[plateSet]}
          hint="Tap to choose a different set"
          onPress={() => onPlateSetChange(plateSet)}
          testID="settings-plate-set"
        />
      </SettingsSection>

      <SettingsSection title="Lifts" testID="settings-section-lifts">
        <View style={{ gap: shape.rXs }}>
          {lifts.map((l) => (
            <SettingRow
              key={l.id}
              label={l.label}
              testID={`settings-lift-${l.id}`}
              trailing={
                <Switch
                  value={l.enabled}
                  onValueChange={() => onToggleLift(l.id)}
                  accessibilityLabel={`Toggle ${l.label}`}
                  testID={`settings-lift-toggle-${l.id}`}
                />
              }
            />
          ))}
        </View>
      </SettingsSection>

      <SettingsSection title="Privacy" testID="settings-section-privacy">
        <SettingRow
          label="Analytics"
          hint="Help us improve by sharing anonymous usage data"
          testID="settings-analytics"
          trailing={
            <Switch
              value={analyticsEnabled}
              onValueChange={onAnalyticsChange}
              accessibilityLabel="Toggle analytics"
              testID="analytics-toggle"
            />
          }
        />
      </SettingsSection>
    </ScrollView>
  );
}

export default SettingsScreen;
