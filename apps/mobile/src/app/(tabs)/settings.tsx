import { Caps } from '@/design/primitives/Caps';
import { Text } from '@/design/primitives/Text';
import { colors, shape } from '@/design/tokens';
import { useAnalyticsStore } from '@/ui-state/analyticsStore';
import { StyleSheet, Switch, View } from 'react-native';

export default function SettingsTab() {
  const enabled = useAnalyticsStore((s) => s.enabled);
  const setEnabled = useAnalyticsStore((s) => s.setEnabled);

  return (
    <View style={styles.container}>
      <Text variant="title">Settings</Text>

      <View style={styles.row}>
        <View style={styles.rowText}>
          <Caps>Analytics</Caps>
          <Text variant="small" tone="ink2">
            Help us improve by sharing anonymous usage data
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={setEnabled}
          accessibilityLabel="Toggle analytics"
          testID="analytics-toggle"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg0,
    padding: shape.rLg,
    gap: shape.rLg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: shape.rLg,
  },
  rowText: {
    flex: 1,
    gap: shape.rXs,
  },
});
