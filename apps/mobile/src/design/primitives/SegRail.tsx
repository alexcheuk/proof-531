import { Pressable, type TextStyle, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { shape, type } from '../tokens';
import { Text } from './Text';

export type SegRailOption<T extends string = string> = T | { value: T; label: string };

export type SegRailProps<T extends string = string> = {
  options: ReadonlyArray<SegRailOption<T>>;
  value: T;
  onChange: (next: T) => void;
  testID?: string;
};

function normalize<T extends string>(o: SegRailOption<T>): { value: T; label: string } {
  return typeof o === 'string' ? { value: o, label: o } : o;
}

export function SegRail<T extends string = string>({
  options,
  value,
  onChange,
  testID,
}: SegRailProps<T>) {
  const theme = useTheme();
  const container: ViewStyle = {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.bg1,
    borderRadius: shape.rPill,
    padding: shape.rXs,
  };
  return (
    <View style={container} testID={testID}>
      {options.map((opt) => {
        const { value: v, label } = normalize(opt);
        const active = v === value;
        const itemStyle: ViewStyle = {
          paddingVertical: shape.rSm,
          paddingHorizontal: shape.rMd,
          borderRadius: shape.rPill,
        };
        const labelStyle: TextStyle = {
          fontFamily: type.sans,
          fontSize: shape.rMd,
          fontWeight: '500',
          color: active ? theme.colors.hot : theme.colors.ink2,
        };
        return (
          <Pressable
            key={v}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(v)}
            style={itemStyle}
          >
            <Text style={labelStyle}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default SegRail;
