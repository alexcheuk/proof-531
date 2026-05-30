import { CapsLabel } from '@/design/primitives/CapsLabel';
import { useTheme } from '@/design/theme';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { useCallback } from 'react';
import { Pressable, Share, View, type ViewStyle } from 'react-native';

export type SharePrPillProps = {
  message: string;
  onCaptureCertificate?: () => Promise<string | null>;
  testID?: string;
};

export function SharePrPill({
  message,
  onCaptureCertificate,
  testID = 'session-complete-share-pr',
}: SharePrPillProps) {
  const { layout, spacing } = useTheme();

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
        <CapsLabel size="md" weight="semibold" color="ink1">
          {'SHARE RECORD →'}
        </CapsLabel>
      </Pressable>
      <CapsLabel size="xs" color="ink3" style={{ marginTop: 2 }}>
        OPENS YOUR SHARE SHEET
      </CapsLabel>
    </View>
  );
}

// Kept pure (no React imports) so it can be unit-tested without a renderer.
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
    ...(delta > 0 ? [`+${delta} ${unit} stronger`] : []),
    '',
    '531 Strength',
  ];
  return lines.join('\n');
}
