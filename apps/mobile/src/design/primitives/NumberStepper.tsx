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

/**
 * Sharp-cornered ink-bordered stepper — two 56×56 paper squares flanking a
 * large weight-num center value. Ported from PWA
 * `src/components/ui/number-stepper.tsx`.
 *
 * Visual idiom matches the LEDGER paper-square form: each button is its own
 * outlined square (no shared rail). Silent-clamp at bounds — pressing a
 * boundary button still fires onChange (with the clamped value, equal to
 * the current value) and a light haptic, matching the Live RestPhase feel.
 *
 * The PWA's `allowDirectInput` (typeable center value) is intentionally NOT
 * ported here; mobile direct-entry via RN TextInput can be added later.
 *
 * Unit display follows the PWA mapping: callers pass storage form
 * (`'lbs' | 'kg' | 'reps' | ...`) and the stepper maps `'lbs'` to the
 * LEDGER glyph `'lb'`. Other strings pass through unchanged.
 */

const STEP_BUTTON_SIZE = 56;
const STEP_GLYPH_FONT_SIZE = 28;
const VALUE_FONT_SIZE = 56;
const VALUE_LETTER_SPACING = -2.24; // -0.04em × 56
const UNIT_FONT_SIZE = 13;
const UNIT_LETTER_SPACING = 2.34; // 0.18em × 13
const LABEL_FONT_SIZE = 10;
const LABEL_LETTER_SPACING = 2.2; // 0.22em × 10
const LABEL_MARGIN_BOTTOM = 8;
const CENTER_GAP = 8;
const ROW_GAP = 8;

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

  const labelStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-Medium',
    fontSize: LABEL_FONT_SIZE,
    lineHeight: LABEL_FONT_SIZE,
    letterSpacing: LABEL_LETTER_SPACING,
    color: colors.ink2,
    textTransform: 'uppercase',
    marginBottom: LABEL_MARGIN_BOTTOM,
  };

  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: ROW_GAP,
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

  const centerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: CENTER_GAP,
    flex: 1,
  };

  const valueStyle: TextStyle = {
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: VALUE_FONT_SIZE,
    lineHeight: VALUE_FONT_SIZE,
    letterSpacing: VALUE_LETTER_SPACING,
    color: colors.ink0,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };

  const unitStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-Medium',
    fontSize: UNIT_FONT_SIZE,
    lineHeight: UNIT_FONT_SIZE,
    letterSpacing: UNIT_LETTER_SPACING,
    color: colors.ink2,
    textTransform: 'uppercase',
  };

  const minusTestID = testID ? `${testID}-minus` : 'ns-minus';
  const plusTestID = testID ? `${testID}-plus` : 'ns-plus';

  return (
    <View testID={testID} style={[containerStyle, style]}>
      {label ? <RNText style={labelStyle}>{label}</RNText> : null}
      <View style={rowStyle}>
        <Pressable
          testID={minusTestID}
          accessibilityRole="button"
          accessibilityLabel={decLabel}
          onPress={() => handleStep(-step)}
          style={stepButtonStyle}
        >
          <RNText style={stepGlyphStyle}>−</RNText>
        </Pressable>
        <View style={centerStyle}>
          <RNText style={valueStyle}>{String(value)}</RNText>
          {unit ? <RNText style={unitStyle}>{unitDisplay}</RNText> : null}
        </View>
        <Pressable
          testID={plusTestID}
          accessibilityRole="button"
          accessibilityLabel={incLabel}
          onPress={() => handleStep(step)}
          style={stepButtonStyle}
        >
          <RNText style={stepGlyphStyle}>+</RNText>
        </Pressable>
      </View>
    </View>
  );
}
