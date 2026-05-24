import { Text as RNText, type StyleProp, type TextStyle, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { CapsLabel } from './CapsLabel';
import { PlateBar } from './PlateBar';
import { Row } from './Row';
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
   * the context.
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

  const weightFontSize = isMini ? 56 : 120;
  const weightStyle: TextStyle = {
    fontFamily: 'IBMPlexSans-Bold',
    fontSize: weightFontSize,
    // RN clips descenders/ascenders when lineHeight < fontSize; pin to 1.0.
    lineHeight: weightFontSize,
    letterSpacing: isMini ? -2.24 : -2.88,
    color: colors.ink0,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };

  const repsFontSize = isMini ? 22 : 32;
  const repsStyle: TextStyle = {
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: repsFontSize,
    lineHeight: repsFontSize,
    letterSpacing: isMini ? -0.44 : -0.48,
    color: colors.ink1,
    marginLeft: isMini ? 8 : 6,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };

  const metaLabel = pctLabel || tmLabel ? [pctLabel, tmLabel].filter(Boolean).join(' · ') : null;

  const inner = (
    <>
      <Row
        justify="space-between"
        style={{ marginBottom: 10 }}
        {...(testID ? { testID: `${testID}-header` } : null)}
      >
        <CapsLabel>{eyebrow}</CapsLabel>
        {metaLabel ? (
          <CapsLabel color="ink3" style={{ letterSpacing: 1.8 }}>
            {metaLabel}
          </CapsLabel>
        ) : null}
      </Row>

      <Row align="baseline" gap="md" {...(testID ? { testID: `${testID}-number-row` } : null)}>
        <Row align="baseline" gap="sm">
          <RNText style={weightStyle} testID={testID ? `${testID}-weight` : undefined}>
            {weight}
          </RNText>
          <CapsLabel
            size="md"
            weight="semibold"
            style={{ letterSpacing: 2.16 }}
            {...(testID ? { testID: `${testID}-unit` } : {})}
          >
            {unitGlyph}
          </CapsLabel>
        </Row>
        <RNText style={repsStyle} testID={testID ? `${testID}-reps` : undefined}>
          × {reps}
          {amrap ? '+' : ''}
        </RNText>
      </Row>

      <View style={{ marginTop: isMini ? 14 : 16 }}>
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
