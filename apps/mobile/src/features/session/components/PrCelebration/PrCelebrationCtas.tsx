import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { Pressable, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type PrCelebrationCtasProps = {
  onContinue: () => void;
};

export function PrCelebrationCtas({ onContinue }: PrCelebrationCtasProps) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  const ctaWrap: ViewStyle = {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + insets.bottom / 2,
    gap: spacing.xs,
  };

  return (
    <View style={ctaWrap}>
      <Pressable
        testID="pr-celebration-continue"
        accessibilityRole="button"
        accessibilityLabel="Continue to Boring But Big"
        onPress={onContinue}
        style={({ pressed }) => ({
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.bg0,
          paddingVertical: spacing.md,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Text variant="sans" weight="bold" size={15} color="bg0" style={{ letterSpacing: 0.4 }}>
          {'Continue  →'}
        </Text>
      </Pressable>
    </View>
  );
}
