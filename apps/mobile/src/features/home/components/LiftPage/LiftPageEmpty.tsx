import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Card } from '@/design/primitives/Card';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';

export type LiftPageEmptyProps = {
  /** testID prefix — the CTA tag is `${prefix}-open-settings`. */
  testIDPrefix?: string;
};

/**
 * "NO TRAINING MAX SET" empty-state block rendered when LiftPage has no
 * TM for the active lift. CTA bounces back into onboarding so a TM can
 * be entered.
 */
export function LiftPageEmpty({ testIDPrefix }: LiftPageEmptyProps) {
  const router = useRouter();
  const { colors, spacing } = useTheme();

  return (
    <Card borders="topBottom" py="xl" style={{ marginTop: spacing.xl, alignItems: 'center' }}>
      <CapsLabel size="md" weight="semibold">
        NO TRAINING MAX SET
      </CapsLabel>
      <Pressable
        onPress={() => router.push('/onboarding')}
        accessibilityRole="button"
        accessibilityLabel="Open onboarding to set a training max"
        testID={testIDPrefix ? `${testIDPrefix}-open-settings` : undefined}
        style={({ pressed }) => [
          {
            marginTop: spacing.md,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            backgroundColor: colors.ink0,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text
          variant="sans"
          weight="bold"
          size={13}
          color="bg0"
          style={{ textTransform: 'uppercase', letterSpacing: 0.78 }}
        >
          Open settings →
        </Text>
      </Pressable>
    </Card>
  );
}
