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
  };

  return (
    <View testID={testID} style={[container, style]}>
      {options.map((opt, i) => {
        const active = opt.value === value;
        const disabled = opt.disabled === true;
        const isLast = i === options.length - 1;

        // Borders live on each segment (top/bottom always, left always for the
        // divider/outer edge, right only on the last segment) instead of on
        // the parent. This makes the active segment's ink0 background paint
        // flush to its own borders — eliminating the hairline gap RN sub-
        // pixel rounding leaves when borders are on the container.
        const segmentStyle: ViewStyle = {
          flex: 1,
          paddingVertical: 12,
          paddingHorizontal: 12,
          backgroundColor: disabled ? 'transparent' : active ? colors.ink0 : 'transparent',
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderLeftWidth: 1,
          borderRightWidth: isLast ? 1 : 0,
          borderColor: colors.ink0,
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
