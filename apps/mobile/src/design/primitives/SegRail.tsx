/**
 * N-option segmented control. Hairline ink border, sharp corners.
 * Active segment fills ink0 with paper text; idle stays transparent.
 *
 * Options may be marked `disabled` to render present-but-unselectable
 * segments (used by Settings' Plate set "Custom" stub).
 *
 * Ported from PWA `src/components/ui/seg-rail.tsx`.
 */
import * as Haptics from 'expo-haptics';
import {
  Pressable,
  Text as RNText,
  type StyleProp,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';

export interface SegRailOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SegRailProps<T extends string> {
  value: T;
  options: ReadonlyArray<SegRailOption<T>>;
  onChange: (next: T) => void;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export function SegRail<T extends string>({
  value,
  options,
  onChange,
  testID,
  style,
}: SegRailProps<T>) {
  const { colors } = useTheme();

  const container: ViewStyle = {
    flexDirection: 'row',
    width: '100%',
    borderWidth: 1,
    borderColor: colors.ink0,
    // overflow:hidden clips children flush to the inner border so the active
    // segment's ink0 fill doesn't leave a hairline gap from sub-pixel rounding.
    overflow: 'hidden',
  };

  return (
    <View testID={testID} style={[container, style]}>
      {options.map((opt, i) => {
        const active = opt.value === value;
        const disabled = opt.disabled === true;

        const segmentStyle: ViewStyle = {
          flex: 1,
          paddingVertical: 12,
          paddingHorizontal: 12,
          backgroundColor: disabled ? 'transparent' : active ? colors.ink0 : 'transparent',
          borderLeftWidth: i > 0 ? 1 : 0,
          borderLeftColor: colors.ink0,
        };

        const labelStyle: TextStyle = {
          fontFamily: 'IBMPlexMono-SemiBold',
          fontSize: 11,
          letterSpacing: 0.22 * 11,
          textTransform: 'uppercase',
          textAlign: 'center',
          color: disabled ? colors.ink4 : active ? colors.bg0 : colors.ink2,
        };

        const handlePress = () => {
          if (disabled) return;
          if (opt.value === value) return;
          Haptics.selectionAsync();
          onChange(opt.value);
        };

        return (
          <Pressable
            key={opt.value}
            onPress={handlePress}
            disabled={disabled}
            testID={testID ? `${testID}-${opt.value}` : undefined}
            accessibilityRole="button"
            accessibilityState={{ selected: active, disabled }}
            style={segmentStyle}
          >
            <RNText style={labelStyle}>{opt.label}</RNText>
          </Pressable>
        );
      })}
    </View>
  );
}
