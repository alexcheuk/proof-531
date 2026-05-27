import { useTheme } from '@/design/theme';
import { Image, View } from 'react-native';

const SPLASH_IMAGE_WIDTH = 140;

/**
 * In-app boot screen rendered between the OS splash and the first real
 * screen. Renders the same splash-icon.png and target width as the
 * expo-splash-screen plugin config in app.json, so the cold-start handoff
 * from native splash to first React frame is pixel-identical.
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
      <Image
        source={require('../../../assets/images/splash-icon.png')}
        style={{ width: SPLASH_IMAGE_WIDTH, height: SPLASH_IMAGE_WIDTH }}
        resizeMode="contain"
      />
    </View>
  );
}
