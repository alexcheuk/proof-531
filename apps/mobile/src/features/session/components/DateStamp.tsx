import { useTheme } from '@/design/theme';
/**
 * Wet-ink circular date stamp for the session-complete receipt.
 *
 * Structural port of `~/Development/531-pwa/src/features/session/components/
 * DateStamp.tsx`. The PWA renders an SVG with arc-text on a circular path
 * (`textPath`). React Native ships without `react-native-svg`, and we are
 * holding the line on extra native deps for the Expo-Go scaffold — so this
 * port approximates the wet-stamp character with a bordered circle + three
 * stacked caps-mono labels (top arc, weekday + date center, year footer).
 *
 * Pure presentational. The parent feeds pre-formatted strings from
 * `formatDateLabel` (domain/summary). The `topArcLabel` swaps to
 * `★  NEW RECORD  ★` on a PR session (parent decides — Rev 5 §B).
 *
 * Boundary note: this file lives under `features/` and uses px/numeric
 * style literals for sizing — same pattern as the rest of the Live/Today
 * components (the hex-only rule in CLAUDE.md is enforced strictly for
 * colors; layout numerics are part of the per-component composition).
 */
import { Text as RNText, View, type ViewStyle } from 'react-native';

export type DateStampProps = {
  /** Uppercased short weekday — `WED`, `TODAY` for the fallback. */
  weekday: string;
  /** Uppercased short month + day — `MAY 22`. Empty string hides the center date. */
  dateLine: string;
  /** Four-digit year string — `2026`. */
  year: string;
  /**
   * Top label. Defaults to `531 · ENTERED`. On PR sessions the parent passes
   * `★  NEW RECORD  ★` (Rev 5 spec §B). U+00B7 middle-dot, not ASCII.
   */
  topArcLabel?: string;
  testID?: string;
};

export function DateStamp({
  weekday,
  dateLine,
  year,
  topArcLabel = '531 · ENTERED',
  testID,
}: DateStampProps) {
  const { colors, type } = useTheme();

  const SIZE = 86;

  const wrapperStyle: ViewStyle = {
    width: SIZE,
    height: SIZE,
    transform: [{ rotate: '-7deg' }],
    opacity: 0.88,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const outerRingStyle: ViewStyle = {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1.4,
    borderColor: colors.ink0,
  };

  const innerRingStyle: ViewStyle = {
    position: 'absolute',
    width: SIZE - 12,
    height: SIZE - 12,
    borderRadius: (SIZE - 12) / 2,
    borderWidth: 0.6,
    borderColor: colors.ink0,
    opacity: 0.5,
  };

  return (
    <View testID={testID} style={wrapperStyle}>
      <View style={outerRingStyle} />
      <View style={innerRingStyle} />
      {/* Top label — `531 · ENTERED` or PR substitution. */}
      <RNText
        testID={testID ? `${testID}-top` : undefined}
        style={{
          position: 'absolute',
          top: 12,
          fontFamily: `${type.mono}-Bold`,
          fontSize: 7,
          letterSpacing: 1.8,
          color: colors.ink0,
          textTransform: 'uppercase',
        }}
      >
        {topArcLabel}
      </RNText>
      {/* Center: weekday + dateLine. */}
      <RNText
        style={{
          fontFamily: `${type.mono}-SemiBold`,
          fontSize: 8,
          letterSpacing: 2.4,
          color: colors.ink0,
          opacity: 0.7,
          textTransform: 'uppercase',
          marginBottom: 2,
        }}
      >
        {weekday}
      </RNText>
      {dateLine ? (
        <RNText
          style={{
            fontFamily: `${type.mono}-Bold`,
            fontSize: 11,
            letterSpacing: 1.5,
            color: colors.ink0,
            textTransform: 'uppercase',
          }}
        >
          {dateLine}
        </RNText>
      ) : null}
      {/* Bottom label — ★ year ★. */}
      <RNText
        style={{
          position: 'absolute',
          bottom: 12,
          fontFamily: `${type.mono}-SemiBold`,
          fontSize: 7,
          letterSpacing: 3,
          color: colors.ink0,
          opacity: 0.7,
        }}
      >
        {`★  ${year}  ★`}
      </RNText>
    </View>
  );
}
