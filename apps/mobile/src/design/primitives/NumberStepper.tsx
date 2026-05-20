import { Pressable, Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
import { colors, shape, type } from '../tokens';
import { WeightNum } from './WeightNum';

export type NumberStepperProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
  unit?: string;
  testID?: string;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const BUTTON_SIZE: ViewStyle = {
  width: shape.rLg * 2 + shape.rMd,
  height: shape.rLg * 2 + shape.rMd,
  borderRadius: shape.rPill,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: colors.bg2,
};

const CONTAINER: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: colors.bg1,
  borderRadius: shape.rPill,
  padding: shape.rSm,
  gap: shape.rXs,
};

const VALUE_GROUP: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'baseline',
  justifyContent: 'center',
  flex: 1,
  gap: shape.rSm,
};

const GLYPH: TextStyle = {
  color: colors.ink0,
  fontSize: shape.rLg,
  fontFamily: type.sans,
  fontWeight: '500',
};

const UNIT: TextStyle = {
  color: colors.ink2,
  fontFamily: type.mono,
  fontSize: shape.rMd,
};

export function NumberStepper({
  value,
  min,
  max,
  step,
  onChange,
  unit,
  testID,
}: NumberStepperProps) {
  const handleDec = () => onChange(clamp(value - step, min, max));
  const handleInc = () => onChange(clamp(value + step, min, max));
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityValue={{ min, max, now: value }}
      style={CONTAINER}
      testID={testID}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Decrement"
        onPress={handleDec}
        style={BUTTON_SIZE}
      >
        <RNText style={GLYPH}>−</RNText>
      </Pressable>
      <View style={VALUE_GROUP}>
        <WeightNum value={value} size="lg" />
        {unit ? <RNText style={UNIT}>{unit}</RNText> : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increment"
        onPress={handleInc}
        style={BUTTON_SIZE}
      >
        <RNText style={GLYPH}>+</RNText>
      </Pressable>
    </View>
  );
}

export default NumberStepper;
