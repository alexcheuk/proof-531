import * as Haptics from 'expo-haptics';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { CapsLabel } from './CapsLabel';
import { Row } from './Row';

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

  return (
    <Row style={[{ width: '100%' }, style]} {...(testID !== undefined ? { testID } : {})}>
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

        const handlePress = () => {
          if (disabled) return;
          if (opt.value === value) return;
          Haptics.selectionAsync();
          onChange(opt.value);
        };

        const labelColor = disabled ? 'ink4' : active ? 'bg0' : 'ink2';

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
            <CapsLabel
              size="md"
              weight="semibold"
              color={labelColor}
              style={{ letterSpacing: 2.42, textAlign: 'center' }}
            >
              {opt.label}
            </CapsLabel>
          </Pressable>
        );
      })}
    </Row>
  );
}
