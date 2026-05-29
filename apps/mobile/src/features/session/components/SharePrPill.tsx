import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { useCallback } from 'react';
import { Pressable, Share, View, type ViewStyle } from 'react-native';

export type SharePrPillProps = {
  /** The pre-formatted share text. Used as fallback if image capture unavailable. */
  message: string;
  /**
   * Optional async function to capture the certificate as an image URI.
   * Provided by the parent (SessionCompleteScreen) via a ViewShot ref.
   * When present, the pill captures the certificate visual and shares that;
   * falls back to text-only if capture fails or returns null.
   */
  onCaptureCertificate?: () => Promise<string | null>;
  testID?: string;
};

export function SharePrPill({
  message,
  onCaptureCertificate,
  testID = 'session-complete-share-pr',
}: SharePrPillProps) {
  const { colors, layout, spacing } = useTheme();

  const onPress = useCallback(async () => {
    void Haptics.selectionAsync();
    try {
      if (onCaptureCertificate) {
        const uri = await onCaptureCertificate();
        if (uri) {
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(uri, { dialogTitle: '531 Strength · New Record' });
            return;
          }
        }
      }
      await Share.share({ message });
    } catch {
      try {
        await Share.share({ message });
      } catch (err) {
        console.error('SharePrPill: share failed', err);
      }
    }
  }, [message, onCaptureCertificate]);

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
        style={{ marginTop: 2, letterSpacing: 1.2 }}
      >
        OPENS YOUR SHARE SHEET
      </Text>
    </View>
  );
}

/**
 * Build the text snippet shared from the receipt when image capture is unavailable.
 * Kept pure for unit testing — the visual pill component is dumb.
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
