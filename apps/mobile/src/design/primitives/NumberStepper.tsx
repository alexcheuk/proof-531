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
import { CapsLabel } from './CapsLabel';
import { Row } from './Row';

// Silent-clamp at bounds: onChange fires even at min/max (with the clamped value) so callers don't need a special case.

const STEP_BUTTON_SIZE = 56;
const STEP_GLYPH_FONT_SIZE = 28;
const VALUE_FONT_SIZE = 56;
const VALUE_LETTER_SPACING = -2.24;
const CENTER_GAP = 8;

export type NumberStepperProps = {
  label?: string;
  value: number;
  onChange: (next: number) => void;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  testID?: string;
  accessibilityLabelDecrement?: string;
  accessibilityLabelIncrement?: string;
  style?: StyleProp<ViewStyle>;
};

export function NumberStepper({
  label,
  value,
  onChange,
  unit,
  step = 1,
  min = 0,
  max = 9999,
  testID,
  accessibilityLabelDecrement,
  accessibilityLabelIncrement,
  style,
}: NumberStepperProps) {
  const { colors } = useTheme();

  const decLabel = accessibilityLabelDecrement ?? `Decrease ${label ?? 'value'}`;
  const incLabel = accessibilityLabelIncrement ?? `Increase ${label ?? 'value'}`;

  const unitDisplay = unit === 'lbs' ? 'lb' : unit;

  const handleStep = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = Math.min(max, Math.max(min, value + delta));
    onChange(next);
  };

  const containerStyle: ViewStyle = {
    alignSelf: 'stretch',
  };

  const stepButtonStyle: ViewStyle = {
    width: STEP_BUTTON_SIZE,
    height: STEP_BUTTON_SIZE,
    borderWidth: 1,
    borderColor: colors.ink0,
    backgroundColor: colors.bg0,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const stepGlyphStyle: TextStyle = {
    fontFamily: 'IBMPlexSans-Regular',
    fontSize: STEP_GLYPH_FONT_SIZE,
    lineHeight: STEP_GLYPH_FONT_SIZE,
    color: colors.ink0,
  };

  const valueStyle: TextStyle = {
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: VALUE_FONT_SIZE,
    lineHeight: VALUE_FONT_SIZE,
    letterSpacing: VALUE_LETTER_SPACING,
    color: colors.ink0,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };

  const minusTestID = testID ? `${testID}-minus` : 'ns-minus';
  const plusTestID = testID ? `${testID}-plus` : 'ns-plus';

  return (
    <View testID={testID} style={[containerStyle, style]}>
      {label ? <CapsLabel style={{ marginBottom: 8 }}>{label}</CapsLabel> : null}
      <Row justify="space-between" gap="sm">
        <Pressable
          testID={minusTestID}
          accessibilityRole="button"
          accessibilityLabel={decLabel}
          onPress={() => handleStep(-step)}
          style={stepButtonStyle}
        >
          <RNText style={stepGlyphStyle}>−</RNText>
        </Pressable>
        <Row align="baseline" justify="center" gap="sm" style={{ flex: 1, gap: CENTER_GAP }}>
          {/* Mark the value text as the live region so a screen reader
              announces the new count after each step press  -  otherwise a
              VoiceOver / TalkBack user only knows the button fired, not
              what the value became. */}
          <RNText
            style={valueStyle}
            accessibilityRole="adjustable"
            accessibilityLabel={label ? `${label}: ${value}` : `${value}`}
            accessibilityValue={{ min, max, now: value }}
            accessibilityLiveRegion="polite"
          >
            {String(value)}
          </RNText>
          {unit ? (
            <CapsLabel size="md" style={{ letterSpacing: 2.34 }}>
              {unitDisplay}
            </CapsLabel>
          ) : null}
        </Row>
        <Pressable
          testID={plusTestID}
          accessibilityRole="button"
          accessibilityLabel={incLabel}
          onPress={() => handleStep(step)}
          style={stepButtonStyle}
        >
          <RNText style={stepGlyphStyle}>+</RNText>
        </Pressable>
      </Row>
    </View>
  );
}
