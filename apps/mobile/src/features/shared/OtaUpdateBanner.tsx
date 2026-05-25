/**
 * Global OTA banner. Sits at the top of the safe area and surfaces two
 * states that the user would otherwise never see:
 *
 *   1. `isDownloading` — Expo is pulling a new bundle in the background.
 *   2. `isUpdatePending` — bundle is on disk and waiting for a reload.
 *
 * The pending state shows a "Restart" pill that calls `Updates.reloadAsync()`.
 * Otherwise the banner stays unmounted so the screen layout never shifts on
 * cold start of an already-up-to-date build.
 */
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { Pressable, View, type ViewStyle } from 'react-native';
import { useOtaStatus } from './useOtaStatus';

export function OtaUpdateBanner() {
  const { colors, spacing, layout } = useTheme();
  const ota = useOtaStatus();

  if (!ota.isDownloading && !ota.isUpdatePending) return null;

  const pending = ota.isUpdatePending;

  const container: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: layout.gutter,
    backgroundColor: colors.ink0,
    gap: spacing.md,
  };

  const buttonStyle: ViewStyle = {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.bg0,
  };

  return (
    <View style={container} accessibilityRole="alert" testID="ota-update-banner">
      <Text variant="mono" weight="semibold" size={10} color="bg0" style={{ letterSpacing: 2.2 }}>
        {pending ? 'UPDATE READY' : 'DOWNLOADING UPDATE…'}
      </Text>
      {pending ? (
        <Pressable
          onPress={() => {
            void ota.applyNow();
          }}
          accessibilityRole="button"
          accessibilityLabel="Restart to apply update"
          style={buttonStyle}
          testID="ota-update-banner-restart"
        >
          <Text variant="mono" weight="bold" size={10} color="bg0" style={{ letterSpacing: 1.8 }}>
            RESTART
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
