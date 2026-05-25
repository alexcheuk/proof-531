import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { Pressable, Share, View, type ViewStyle } from 'react-native';

/**
 * Tiny "Share record" pill rendered under the PR certificate on the
 * receipt. Opens the native iOS / Android share sheet with a text
 * summary of the lift, the new estimated 1RM, and the delta — so the
 * user can drop it into WhatsApp / iMessage / wherever without leaving
 * Expo Go (the share-image path needs `react-native-view-shot` which
 * isn't bundled in the Expo Go runtime).
 *
 * Pure presentational — the parent passes the formatted text.
 */
export type SharePrPillProps = {
  /** The pre-formatted share text. Built by `buildPrShareMessage`. */
  message: string;
  testID?: string;
};

export function SharePrPill({ message, testID = 'session-complete-share-pr' }: SharePrPillProps) {
  const { colors, layout, spacing, type } = useTheme();

  const onPress = useCallback(async () => {
    void Haptics.selectionAsync();
    try {
      await Share.share({ message });
    } catch (err) {
      console.error('SharePrPill.onPress Share.share failed', err);
    }
  }, [message]);

  const containerStyle: ViewStyle = {
    paddingHorizontal: layout.gutter,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  };

  return (
    <View style={containerStyle}>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel="Share this personal record"
        onPress={onPress}
        hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
        style={({ pressed }) => ({
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.md,
          opacity: pressed ? 0.5 : 1,
        })}
      >
        <Text
          variant="mono"
          weight="semibold"
          size={11}
          style={{ letterSpacing: 2, color: colors.ink1 }}
        >
          {'SHARE RECORD →'}
        </Text>
      </Pressable>
      <Text
        variant="mono"
        weight="regular"
        size={9}
        color="ink3"
        style={{ marginTop: 2, letterSpacing: 1.2, fontFamily: `${type.mono}-Regular` }}
      >
        OPENS YOUR SHARE SHEET
      </Text>
    </View>
  );
}

/**
 * Build the text snippet shared from the receipt. Kept pure for unit
 * testing — the visual pill component is dumb.
 */
export type BuildPrShareMessageInput = {
  liftLabel: string;
  e1RM: number;
  delta: number;
  unit: 'lb' | 'kg';
};

export function buildPrShareMessage({
  liftLabel,
  e1RM,
  delta,
  unit,
}: BuildPrShareMessageInput): string {
  const lines = [
    '★ NEW RECORD ★',
    `${liftLabel} · ${e1RM} ${unit} estimated 1RM`,
    `+${delta} ${unit} stronger`,
    '',
    '531 Strength',
  ];
  return lines.join('\n');
}
