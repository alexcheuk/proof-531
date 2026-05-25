import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { View } from 'react-native';

/**
 * In-app boot screen rendered between the OS splash (a paper-colored
 * canvas) and the first real screen. Paints the 531 wordmark in the
 * already-loaded Plex Display Condensed face so the cold-start handoff
 * feels branded even before the splash PNG carries the mark.
 *
 * Kept intentionally tiny — just the wordmark on the paper canvas. The
 * status bar / safe areas wrap this from RootLayout.
 */
export function BootSplash({ testID = 'boot-splash' }: { testID?: string }) {
  const { colors } = useTheme();
  return (
    <View
      testID={testID}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg0,
      }}
    >
      <Text variant="condensed" weight="bold" size={72} color="ink0" style={{ letterSpacing: -2 }}>
        531
      </Text>
      <Text
        variant="mono"
        weight="medium"
        size={10}
        color="ink3"
        style={{ marginTop: 6, letterSpacing: 3 }}
      >
        STRENGTH
      </Text>
    </View>
  );
}
