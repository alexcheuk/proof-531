/**
 * Confirm sheet for the destructive storage-unit migration.
 *
 * Ported from `~/Development/531-pwa/src/features/settings/components/UnitMigrationSheet.tsx`.
 * Preview table lists each enabled lift's current TM and its converted value
 * at the target storage unit, so the user sees what's about to be rewritten.
 */
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { Row } from '@/design/primitives/Row';
import { SheetLayout } from '@/design/primitives/SheetLayout';
import { useTheme } from '@/design/theme';
import type { Lift, Unit } from '@/domain/types';
import { displayUnit as displayUnitGlyph } from '@/domain/units';
import { Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
import { LIFT_META } from '../lifts';

export interface TmPreview {
  lift: Lift;
  oldValue: number;
  oldUnit: Unit;
  newValue: number;
}

export interface UnitMigrationSheetProps {
  open: boolean;
  currentUnit: Unit;
  targetUnit: Unit;
  tmPreviews: TmPreview[];
  onCancel: () => void;
  onConfirm: () => void;
  pending?: boolean;
}

export function UnitMigrationSheet({
  open,
  currentUnit,
  targetUnit,
  tmPreviews,
  onCancel,
  onConfirm,
  pending = false,
}: UnitMigrationSheetProps) {
  const { colors, type, spacing } = useTheme();
  const targetGlyph = displayUnitGlyph(targetUnit);
  const currentGlyph = displayUnitGlyph(currentUnit);
  const step = targetUnit === 'lbs' ? '5 lb' : '2.5 kg';

  const paragraphStyle: TextStyle = {
    fontFamily: type.sans,
    fontSize: 13,
    lineHeight: 19,
    color: colors.ink2,
    marginTop: 10,
    marginBottom: 4,
  };

  const previewBox: ViewStyle = {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    marginTop: 4,
    marginBottom: spacing.md,
  };

  const previewLiftLabel: TextStyle = {
    flex: 1,
    fontFamily: `${type.sans}-SemiBold`,
    fontSize: 14,
    letterSpacing: -0.21,
    color: colors.ink0,
  };

  const previewOldValue: TextStyle = {
    fontFamily: `${type.sans}-SemiBold`,
    fontSize: 15,
    letterSpacing: -0.15,
    color: colors.ink2,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };

  const previewGlyphSmall: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 9,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
    color: colors.ink3,
    marginLeft: 6,
  };

  const previewArrow: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 12,
    color: colors.ink3,
    marginHorizontal: spacing.sm,
  };

  const previewNewValue: TextStyle = {
    fontFamily: `${type.sans}-Bold`,
    fontSize: 16,
    letterSpacing: -0.32,
    color: colors.ink0,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };

  const previewGlyphStrong: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 9,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
    color: colors.ink2,
    marginLeft: 6,
  };

  const emptyNote: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 9,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
    color: colors.ink3,
    paddingVertical: 12,
  };

  return (
    <SheetLayout
      open={open}
      onDismiss={onCancel}
      testID="unit-migration-sheet"
      snapPoints={['70%']}
      scroll
      eyebrow="CONFIRM"
      title="Switch training unit?"
      pending={pending}
      primary={
        <PrimaryPillButton
          testID="unit-migration-confirm"
          onPress={onConfirm}
          disabled={pending}
          glyph="→"
          accessibilityLabel={`Convert training maxes to ${targetGlyph}`}
        >
          {`Convert to ${targetGlyph}`}
        </PrimaryPillButton>
      }
      cancel={{
        label: `Keep ${currentGlyph}`,
        onPress: onCancel,
        variant: 'outlined',
        testID: 'unit-migration-cancel',
        accessibilityLabel: 'Cancel storage unit migration',
      }}
    >
      <RNText style={paragraphStyle}>
        Your training maxes will be converted to {targetGlyph} and snapped to the nearest {step}.
        History rows keep their original unit.
      </RNText>

      {tmPreviews.length > 0 ? (
        <View style={previewBox}>
          {tmPreviews.map((p, i) => {
            const oldGlyph = displayUnitGlyph(p.oldUnit);
            const rowStyle: ViewStyle = {
              paddingVertical: 10,
              borderTopWidth: i === 0 ? 0 : 1,
              borderTopColor: colors.line,
            };
            return (
              <Row key={p.lift} style={rowStyle} testID={`unit-migration-row-${p.lift}`}>
                <RNText style={previewLiftLabel}>{LIFT_META[p.lift].label}</RNText>
                <RNText style={previewOldValue}>
                  {p.oldValue}
                  <RNText style={previewGlyphSmall}> {oldGlyph}</RNText>
                </RNText>
                <RNText style={previewArrow}>{'→'}</RNText>
                <RNText style={previewNewValue}>
                  {p.newValue}
                  <RNText style={previewGlyphStrong}> {targetGlyph}</RNText>
                </RNText>
              </Row>
            );
          })}
        </View>
      ) : (
        <RNText style={emptyNote}>nothing to convert · settings are still updated</RNText>
      )}
    </SheetLayout>
  );
}
