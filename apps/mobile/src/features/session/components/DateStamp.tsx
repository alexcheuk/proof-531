import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
// SVG arc-text (textPath) would be ideal but react-native-svg is a native dep we're avoiding;
// this approximates the wet-stamp with a bordered circle + stacked caps-mono labels.
import { View, type ViewStyle } from 'react-native';

export type DateStampProps = {
  /** Uppercased short weekday  -  `WED`, `TODAY` for the fallback. */
  weekday: string;
  /** Uppercased short month + day  -  `MAY 22`. Empty string hides the center date. */
  dateLine: string;
  /** Four-digit year string  -  `2026`. */
  year: string;
  // defaults to "531 · ENTERED"; PR sessions pass "★ NEW RECORD ★" (U+00B7 middle-dot)
  topArcLabel?: string;
  testID?: string;
};

const SIZE = 86;
const INNER_OFFSET = 12;
const STROKE_OUTER = 1.4;
const STROKE_INNER = 0.6;
const INNER_OPACITY = 0.5;
const STAMP_OPACITY = 0.88;
const ROTATION_DEG = -7;

type StampLabelStyle = {
  family: 'bold' | 'semibold';
  fontSize: number;
  letterSpacing: number;
  /** Optional opacity for the label (0..1). Defaults to 1. */
  opacity?: number;
};

export function DateStamp({
  weekday,
  dateLine,
  year,
  topArcLabel = '531 · ENTERED',
  testID,
}: DateStampProps) {
  const { colors } = useTheme();

  const wrapperStyle: ViewStyle = {
    width: SIZE,
    height: SIZE,
    transform: [{ rotate: `${ROTATION_DEG}deg` }],
    opacity: STAMP_OPACITY,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const outerRingStyle: ViewStyle = {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: STROKE_OUTER,
    borderColor: colors.ink0,
  };

  const innerRingStyle: ViewStyle = {
    position: 'absolute',
    width: SIZE - INNER_OFFSET,
    height: SIZE - INNER_OFFSET,
    borderRadius: (SIZE - INNER_OFFSET) / 2,
    borderWidth: STROKE_INNER,
    borderColor: colors.ink0,
    opacity: INNER_OPACITY,
  };

  return (
    <View testID={testID} style={wrapperStyle}>
      <View style={outerRingStyle} />
      <View style={innerRingStyle} />
      <StampLabel
        text={topArcLabel}
        style={{ family: 'bold', fontSize: 7, letterSpacing: 1.8 }}
        position={{ top: 12 }}
        {...(testID ? { testID: `${testID}-top` } : {})}
      />
      <StampLabel
        text={weekday}
        style={{ family: 'semibold', fontSize: 8, letterSpacing: 2.4, opacity: 0.7 }}
        spacingBelow={2}
      />
      {dateLine ? (
        <StampLabel text={dateLine} style={{ family: 'bold', fontSize: 11, letterSpacing: 1.5 }} />
      ) : null}
      <StampLabel
        text={`★  ${year}  ★`}
        style={{ family: 'semibold', fontSize: 7, letterSpacing: 3, opacity: 0.7 }}
        position={{ bottom: 12 }}
      />
    </View>
  );
}

type StampLabelProps = {
  text: string;
  style: StampLabelStyle;
  /** Absolute positioning slot (top or bottom). Undefined leaves the label in flow. */
  position?: { top?: number; bottom?: number };
  /** Adds marginBottom in flow layout  -  useful for the weekday + date stack. */
  spacingBelow?: number;
  testID?: string;
};

function StampLabel({ text, style, position, spacingBelow, testID }: StampLabelProps) {
  return (
    <Text
      variant="mono"
      weight={style.family}
      size={style.fontSize}
      color="ink0"
      {...(testID !== undefined ? { testID } : {})}
      style={[
        { letterSpacing: style.letterSpacing, textTransform: 'uppercase' },
        style.opacity !== undefined ? { opacity: style.opacity } : null,
        position ? { position: 'absolute', ...position } : null,
        spacingBelow !== undefined ? { marginBottom: spacingBelow } : null,
      ]}
    >
      {text}
    </Text>
  );
}
