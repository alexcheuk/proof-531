import { LabeledSegRail } from '@/design/primitives/LabeledSegRail';
import { LedgerRow, LedgerRowLabel } from '@/design/primitives/LedgerRow';
import { LedgerSection } from '@/design/primitives/LedgerSection';
import { SegRail } from '@/design/primitives/SegRail';
import { Text } from '@/design/primitives/Text';
import type { RestAlarmSound } from '@/domain/types';
import {
  type RestReliability,
  getRestReliability,
  openBatteryOptimizationSettings,
  openExactAlarmSettings,
  openRestDoneSoundSettings,
} from '@/lib/restChronometer';
import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { useUpdateSettings } from '../hooks/useUpdateSettings';

const SOUND_OPTIONS: ReadonlyArray<{ value: RestAlarmSound; label: string }> = [
  { value: 'alarm', label: 'Alarm' },
  { value: 'chime', label: 'Chime' },
];

export type RestAlarmSectionProps = {
  restAlarmSound: RestAlarmSound;
};

/**
 * Android-only: the completion sound is a notification-channel property, and
 * the reliability rows fix Android-specific throttling (exact alarms, battery
 * optimization). iOS plays the default notification sound at the deadline and
 * needs neither. Renders nothing on iOS.
 */
export function RestAlarmSection({ restAlarmSound }: RestAlarmSectionProps) {
  const updateSettings = useUpdateSettings();
  const [reliability, setReliability] = useState<RestReliability>({
    exactAlarmsEnabled: null,
    batteryOptimized: null,
  });

  // Re-check on foreground so returning from the OS settings screens the rows
  // link to updates (or clears) the warnings without an app restart.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    let cancelled = false;
    const refresh = () => {
      void getRestReliability().then((next) => {
        if (!cancelled) setReliability(next);
      });
    };
    refresh();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  if (Platform.OS !== 'android') return null;

  const showExactAlarmRow = reliability.exactAlarmsEnabled === false;
  const showBatteryRow = reliability.batteryOptimized === true;

  return (
    <LedgerSection title="Rest alarm" hint="sound when rest completes">
      <LabeledSegRail
        label="Sound"
        hint={
          restAlarmSound === 'alarm'
            ? "Your device's alarm sound · loud enough for the gym"
            : 'Standard notification chime'
        }
      >
        <SegRail<RestAlarmSound>
          testID="settings-rest-alarm-sound"
          value={restAlarmSound}
          options={SOUND_OPTIONS}
          onChange={(next) => void updateSettings({ restAlarmSound: next })}
        />
      </LabeledSegRail>
      <LedgerRow
        onPress={() => void openRestDoneSoundSettings(restAlarmSound)}
        testID="settings-rest-alarm-pick-sound"
        accessibilityLabel="Pick a specific sound. Opens Android's sound picker for the rest alert."
      >
        <LedgerRowLabel
          primary="Pick a specific sound"
          secondary="choose any device sound in Android settings"
        />
        <Text variant="mono" weight="semibold" size={13} color="ink3">
          ›
        </Text>
      </LedgerRow>
      {showExactAlarmRow ? (
        <LedgerRow
          onPress={() => void openExactAlarmSettings()}
          testID="settings-rest-alarm-exact"
          accessibilityLabel="Allow exact alarms. Without this Android delays the rest alert."
        >
          <LedgerRowLabel
            primary="Allow exact alarms"
            secondary="without this Android delays the alert"
          />
          <Text variant="mono" weight="semibold" size={13} color="ink3">
            ›
          </Text>
        </LedgerRow>
      ) : null}
      {showBatteryRow ? (
        <LedgerRow
          onPress={() => void openBatteryOptimizationSettings()}
          testID="settings-rest-alarm-battery"
          accessibilityLabel="Turn off battery optimization for this app so the timer isn't throttled in the background."
        >
          <LedgerRowLabel
            primary="Disable battery optimization"
            secondary="stops Android from throttling the timer"
          />
          <Text variant="mono" weight="semibold" size={13} color="ink3">
            ›
          </Text>
        </LedgerRow>
      ) : null}
    </LedgerSection>
  );
}
