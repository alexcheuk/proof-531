import { Text as RNText, type StyleProp, type TextStyle, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { PlateBar } from './PlateBar';
import { SectionBand } from './SectionBand';

/**
 * Caps label + meta + giant weight + `× reps` + `PlateBar`.
 *
 * Used on Home (mini plate variant) and Today (full plate, also serves as the
 * screen's hero strip). Pure — the caller computes the displayed weight via
 * `snapWeight(snapshotTM × pct, unit)` and the matching `perSide` plate
 * decomposition (heaviest first) and passes them in. Keeping plate math out
 * about the domain.
 *
 *   bordered=true   → renders own top/bottom hairlines + py (Home).
 *   bordered=false  → no chrome; parent provides section spacing (Today).
 *
 * Ported from PWA `src/components/top-set-block.tsx`.
 */

export type TopSetBlockProps = {
  /** Total weight on the bar, in the display unit (already converted). */
  weight: number;
  /** Display glyph for the unit, e.g. "lb" or "kg". */
  unitGlyph: string;
  /** Prescribed rep count for the top set. */
  reps: number;
  /** When true, render the AMRAP "+" marker after `reps`. */
  amrap: boolean;
  /**
   * Right-side eyebrow meta — e.g. "85%". When both `pctLabel` and `tmLabel`
   * are omitted the right meta cell is hidden, so the eyebrow can carry all
   * the context (used on the Live screen where the eyebrow reads
   * "SQUAT · 65% TM" and no extra meta is needed).
   */
  pctLabel?: string;
  /** Right-side eyebrow meta — e.g. "TM 245". */
  tmLabel?: string;
  /** Pre-computed plate decomposition (heaviest first). */
  perSide: readonly number[];
  /** `mini` shrinks weight + plate sizes (Home); `full` is hero-sized (Today). */
  plateVariant: 'mini' | 'full';
  /** When true, wrap content in a SectionBand with top + bottom hairlines. */
  bordered?: boolean;
  /**
   * Caps eyebrow label. Defaults to "TOP SET" (the climax row on Home). Pass
   * "NEXT SET" on Today / Rest where the block tracks the next prescription.
   */
  eyebrow?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function TopSetBlock({
  weight,
  unitGlyph,
  reps,
  amrap,
  pctLabel,
  tmLabel,
  perSide,
  plateVariant,
  bordered = false,
  eyebrow = 'TOP SET',
  testID,
  style,
}: TopSetBlockProps) {
  const { colors } = useTheme();
  const isMini = plateVariant === 'mini';

  const headerRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // RN does not support 'baseline'; 'center' is the closest visual match.
    alignItems: 'center',
    marginBottom: 10,
  };

  const eyebrowStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-Medium',
    fontSize: 10,
    lineHeight: 10,
    letterSpacing: 2.2, // 0.22em × 10 — caps spec
    textTransform: 'uppercase',
    color: colors.ink2,
  };

  const metaStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-Medium',
    fontSize: 10,
    lineHeight: 10,
    letterSpacing: 1.8, // 0.18em × 10
    textTransform: 'uppercase',
    color: colors.ink3,
  };

  const numberRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  };

  const weightFontSize = isMini ? 56 : 120;
  const weightStyle: TextStyle = {
    fontFamily: 'IBMPlexSans-Bold',
    fontSize: weightFontSize,
    // RN clips descenders/ascenders when lineHeight < fontSize; pin to 1.0.
    lineHeight: weightFontSize,
    letterSpacing: isMini ? -2.24 : -2.88, // -0.04em × 56 / -0.045em × 64
    color: colors.ink0,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };

  const unitStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-SemiBold',
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 2.16, // 0.18em × 12
    textTransform: 'uppercase',
    color: colors.ink2,
  };

  const repsFontSize = isMini ? 22 : 32;
  const repsStyle: TextStyle = {
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: repsFontSize,
    lineHeight: repsFontSize,
    letterSpacing: isMini ? -0.44 : -0.48, // -0.02em × size
    color: colors.ink1,
    marginLeft: isMini ? 8 : 6,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };

  const plateRowStyle: ViewStyle = {
    marginTop: isMini ? 14 : 16,
  };

  const inner = (
    <>
      <View style={headerRowStyle} testID={testID ? `${testID}-header` : undefined}>
        <RNText style={eyebrowStyle}>{eyebrow}</RNText>

        {pctLabel || tmLabel ? (
          <RNText style={metaStyle}>{[pctLabel, tmLabel].filter(Boolean).join(' · ')}</RNText>
        ) : null}
      </View>

      <View style={numberRowStyle} testID={testID ? `${testID}-number-row` : undefined}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <RNText style={weightStyle} testID={testID ? `${testID}-weight` : undefined}>
            {weight}
          </RNText>
          <RNText style={unitStyle} testID={testID ? `${testID}-unit` : undefined}>
            {unitGlyph}
          </RNText>
        </View>
        <RNText style={repsStyle} testID={testID ? `${testID}-reps` : undefined}>
          × {reps}
          {amrap ? '+' : ''}
        </RNText>
      </View>

      <View style={plateRowStyle}>
        <PlateBar
          weight={weight}
          unitGlyph={unitGlyph}
          perSide={perSide}
          mini={isMini}
          {...(testID ? { testID: `${testID}-plate-bar` } : null)}
        />
      </View>
    </>
  );

  if (bordered) {
    return (
      <SectionBand
        padding="none"
        tone="default"
        style={[{ paddingTop: 14, paddingBottom: 18 }, style]}
        {...(testID ? { testID } : null)}
      >
        {inner}
      </SectionBand>
    );
  }

  return (
    <View testID={testID} style={style}>
      {inner}
    </View>
  );
}
