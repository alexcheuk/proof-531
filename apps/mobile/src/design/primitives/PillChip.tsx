import { useTheme } from '@/design/theme';
import { Pressable, Text as RNText, type TextStyle, type ViewStyle } from 'react-native';

/**
 * Caps-mono chip used in horizontal selectors (History filter row,
 * future toolbar slots). Two tones:
 *   - `default` — hairline border, ink fill when selected
 *   - `ghost`   — dashed border + lighter copy; used for clear/reset chips
 *
 * Composition rules:
 *   - Selected chips invert to bg-on-ink
 *   - Ghost chips never fill on tap, just dim opacity
 *   - testID is required so callers can assert on chip presence in tests
 */
export type PillChipTone = 'default' | 'ghost';

export type PillChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID: string;
  tone?: PillChipTone;
  accessibilityLabel?: string;
};

export function PillChip({
  label,
  selected,
  onPress,
  testID,
  tone = 'default',
  accessibilityLabel,
}: PillChipProps) {
  const { colors, type } = useTheme();
  const chipStyle: ViewStyle = {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: selected ? colors.ink0 : colors.line,
    backgroundColor: selected ? colors.ink0 : 'transparent',
    ...(tone === 'ghost' ? { borderStyle: 'dashed', borderColor: colors.lineStrong } : {}),
  };
  const labelStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: selected ? colors.bg0 : tone === 'ghost' ? colors.ink1 : colors.ink2,
  };
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? `Filter: ${label}${selected ? ', selected' : ''}`}
      testID={testID}
      style={({ pressed }) => [chipStyle, pressed && !selected ? { opacity: 0.7 } : null]}
    >
      <RNText style={labelStyle}>{label}</RNText>
    </Pressable>
  );
}
