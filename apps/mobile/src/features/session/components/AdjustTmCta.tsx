import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { Pressable, View, type ViewStyle } from 'react-native';

export type AdjustTmCtaProps = {
  /** e1RM delta over the previous best, in display unit (e.g. 12). */
  delta: number;
  /** Display unit glyph  -  "lb" or "kg". */
  unitGlyph: 'lb' | 'kg';
  onPress: () => void;
  testID?: string;
};

export function AdjustTmCta({
  delta,
  unitGlyph,
  onPress,
  testID = 'session-complete-adjust-tm',
}: AdjustTmCtaProps) {
  const { colors, spacing } = useTheme();

  const ctaStyle: ViewStyle = {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md + 2,
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel="Adjust training max in settings"
      accessibilityHint="Opens settings on the training max section"
      onPress={onPress}
      style={({ pressed }) => [ctaStyle, pressed ? { opacity: 0.6 } : null]}
    >
      <View>
        <CapsLabel size="md" weight="semibold" color="ink0" style={{ letterSpacing: 1.8 }}>
          Adjust training max
        </CapsLabel>
        <CapsLabel size="xs" color="ink3" style={{ marginTop: 2 }}>
          {`e1rm jumped ${delta} ${unitGlyph}  -  consider a bump`}
        </CapsLabel>
      </View>
      <Text variant="mono" weight="semibold" size={16} color="ink0">
        ›
      </Text>
    </Pressable>
  );
}
