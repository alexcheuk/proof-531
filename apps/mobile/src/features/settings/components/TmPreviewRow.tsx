import { Row } from '@/design/primitives/Row';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { Lift, Unit } from '@/domain/types';
import { displayUnit as displayUnitGlyph } from '@/domain/units';
import { Text as RNText, type TextStyle, type ViewStyle } from 'react-native';
import { LIFT_META } from '../lifts';

export type TmPreviewRowProps = {
  lift: Lift;
  oldValue: number;
  oldUnit: Unit;
  newValue: number;
  targetUnit: Unit;
  /** Index in the parent list — drives the top hairline (skip on the first row). */
  index: number;
};

/**
 * One row of the unit-migration preview table. Renders:
 *   <lift>   <oldValue><oldGlyph> → <newValue><newGlyph>
 *
 * The arrow and the new value carry visual weight (sans-bold ink-0); the
 * old value is the smaller, lighter peer so the user reads the
 * transformation L → R at a glance.
 */
export function TmPreviewRow({
  lift,
  oldValue,
  oldUnit,
  newValue,
  targetUnit,
  index,
}: TmPreviewRowProps) {
  const { colors, type, spacing } = useTheme();
  const oldGlyph = displayUnitGlyph(oldUnit);
  const targetGlyph = displayUnitGlyph(targetUnit);

  const rowStyle: ViewStyle = {
    paddingVertical: 10,
    borderTopWidth: index === 0 ? 0 : 1,
    borderTopColor: colors.line,
  };
  // Inline glyph spans nested inside Text — must be RNText for inline text flow.
  // letterSpacing 1.26 is intentionally tighter than CapsLabel presets.
  const oldGlyphStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 9,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
    color: colors.ink3,
    marginLeft: 6,
  };
  const newGlyphStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 9,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
    color: colors.ink2,
    marginLeft: 6,
  };

  return (
    <Row style={rowStyle} testID={`unit-migration-row-${lift}`}>
      <Text
        variant="sans"
        weight="semibold"
        size={14}
        color="ink0"
        style={{ flex: 1, letterSpacing: -0.21 }}
      >
        {LIFT_META[lift].label}
      </Text>
      <Text
        variant="sans"
        weight="semibold"
        size={15}
        color="ink2"
        numeric
        style={{ letterSpacing: -0.15 }}
      >
        {oldValue}
        <RNText style={oldGlyphStyle}> {oldGlyph}</RNText>
      </Text>
      <Text
        variant="mono"
        weight="semibold"
        size={12}
        color="ink3"
        style={{ marginHorizontal: spacing.sm }}
      >
        {'→'}
      </Text>
      <Text
        variant="sans"
        weight="bold"
        size={16}
        color="ink0"
        numeric
        style={{ letterSpacing: -0.32 }}
      >
        {newValue}
        <RNText style={newGlyphStyle}> {targetGlyph}</RNText>
      </Text>
    </Row>
  );
}
