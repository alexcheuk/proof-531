/**
 * Resume banner — a session-recovery surface shown on Home when there is an
 * active (in-progress) session. Wave 1 of the workout-flow redesign.
 *
 * Layout: a full-width band with hairlines on top and bottom, padded by
 * `spacing.xl` horizontally and `spacing.md` vertically. Three regions in a
 * single row:
 *   - Left: a `★` glyph + lift label (caps) + the static "IN PROGRESS" hint.
 *   - Middle: a mono caps relative time string ("14 min ago", "Yesterday").
 *   - Right: "Resume →" affordance.
 *
 * Pure presentational. The consuming feature owns the active-session query and
 * dismissal state. The banner exposes both `onResume` (whole-band tap) and
 * `onDismiss` (accessibility action + parent-driven swipe gesture); the
 * swipe-dismiss gesture itself is intentionally handled at the feature level
 * via Reanimated so this primitive stays render-only and easy to test.
 *
 * Tokens used: `spacing.md`, `spacing.xl`, `colors.bg1`, `colors.ink0`,
 * `colors.ink2`, `colors.lineStrong`, `type.sans`, `type.mono`.
 *
 * Accessibility:
 *   - The outer Pressable is `accessibilityRole="button"`.
 *   - `accessibilityLabel` is composed by the parent and passed through; this
 *     primitive does not synthesize labels from the visible text because the
 *     parent already has the lift name in title-case form (and the label
 *     wants "Resume Squat session, started 14 minutes ago" — a phrasing
 *     this primitive doesn't have enough context to produce on its own).
 *   - An `accessibilityActions` entry of `name: 'dismiss'` is wired to
 *     `onDismiss` so VoiceOver/TalkBack users can dismiss without swiping.
 */
import { Pressable, type StyleProp, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export type ResumeBannerProps = {
  /** Title-case lift name, e.g. "Squat". The primitive renders it uppercased. */
  liftLabel: string;
  /** Pre-formatted relative time string from `relativeTimeLabel(...)`. */
  relativeTime: string;
  onResume: () => void;
  onDismiss: () => void;
  /** Caller-composed VoiceOver/TalkBack label. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function ResumeBanner({
  liftLabel,
  relativeTime,
  onResume,
  onDismiss,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
}: ResumeBannerProps) {
  const { colors, spacing } = useTheme();

  const containerStyle: ViewStyle = {
    width: '100%',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.bg1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lineStrong,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  };

  const leftStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  };

  const middleStyle: ViewStyle = {
    flexShrink: 1,
  };

  return (
    <Pressable
      testID={testID}
      onPress={onResume}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityActions={[{ name: 'dismiss', label: 'Dismiss banner' }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'dismiss') onDismiss();
      }}
      style={[containerStyle, style]}
    >
      <View style={leftStyle}>
        <Text variant="mono" weight="bold" size={12} color="ink0">
          ★
        </Text>
        <Text
          variant="sans"
          weight="medium"
          size={14}
          color="ink0"
          style={{ textTransform: 'uppercase', letterSpacing: 1.8 }}
        >
          {liftLabel}
        </Text>
        <Text
          variant="mono"
          weight="semibold"
          size={10}
          color="ink2"
          style={{ textTransform: 'uppercase', letterSpacing: 1.8 }}
        >
          · IN PROGRESS
        </Text>
      </View>
      <View style={middleStyle}>
        <Text
          variant="mono"
          weight="medium"
          size={10}
          color="ink2"
          numberOfLines={1}
          style={{ textTransform: 'uppercase', letterSpacing: 1.8 }}
        >
          {relativeTime}
        </Text>
      </View>
      <Text
        variant="sans"
        weight="semibold"
        size={12}
        color="ink0"
        style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
      >
        Resume →
      </Text>
    </Pressable>
  );
}
