/**
 * Session-not-found shell (W1.4).
 *
 * Replaces the silent `return null` that used to live in the `today`,
 * `live`, and `complete` route shells when the URL parameters fail to
 * resolve to a sessionable target (invalid lift, NaN sessionId, deleted row).
 *
 * Visual: caps eyebrow `NOT FOUND` over a sans-medium headline + a single
 * line of body copy + a primary CTA returning Home via `router.replace('/')`.
 * The headline container is `accessibilityRole="alert"` so VoiceOver
 * announces the state on mount.
 *
 * Lives in `features/session/components/` because it composes feature-local
 * SessionLayout with design primitives — not generic enough to be a
 * design-system primitive on its own.
 */
import { CtaBar } from '@/design/primitives/CtaBar';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, type ViewStyle } from 'react-native';
import { SessionLayout } from './SessionLayout';

export type SessionNotFoundProps = {
  testID?: string;
};

export function SessionNotFound({ testID }: SessionNotFoundProps) {
  const router = useRouter();
  const { colors, spacing } = useTheme();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.bg0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    justifyContent: 'center',
    alignItems: 'flex-start',
  };
  const bodyStyle: ViewStyle = {
    maxWidth: 280,
    marginTop: spacing.md,
  };

  return (
    <SessionLayout testID={testID ?? 'session-not-found'}>
      <StatusBar style="dark" />
      <View style={containerStyle}>
        <View accessibilityRole="alert">
          <Text
            variant="mono"
            weight="semibold"
            size={10}
            color="ink2"
            style={{ textTransform: 'uppercase', letterSpacing: 2.2 }}
          >
            NOT FOUND
          </Text>
          <Text
            variant="sans"
            weight="medium"
            size={32}
            color="ink0"
            style={{ letterSpacing: -0.96, marginTop: spacing.sm }}
          >
            Session not found.
          </Text>
        </View>
        <View style={bodyStyle}>
          <Text variant="sans" weight="regular" size={14} color="ink2">
            This session can't be opened. It may have been cancelled or removed.
          </Text>
        </View>
      </View>
      <CtaBar>
        <PrimaryPillButton
          testID="session-not-found-cta"
          glyph="←"
          accessibilityLabel="Back to Home"
          onPress={() => router.replace('/' as never)}
        >
          Back to Home
        </PrimaryPillButton>
      </CtaBar>
    </SessionLayout>
  );
}
