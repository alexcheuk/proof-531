/**
 * Confirm sheet for the destructive storage-unit migration.
 *
 * Ported from `the PWA reference`.
 * Preview table lists each enabled lift's current TM and its converted value
 * at the target storage unit, so the user sees what's about to be rewritten.
 */
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { SheetLayout } from '@/design/primitives/SheetLayout';
import { useTheme } from '@/design/theme';
import type { Lift, Unit } from '@/domain/types';
import { displayUnit as displayUnitGlyph } from '@/domain/units';
import { Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
import { TmPreviewRow } from './TmPreviewRow';

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
          {tmPreviews.map((p, i) => (
            <TmPreviewRow
              key={p.lift}
              index={i}
              lift={p.lift}
              oldValue={p.oldValue}
              oldUnit={p.oldUnit}
              newValue={p.newValue}
              targetUnit={targetUnit}
            />
          ))}
        </View>
      ) : (
        <CapsLabel size="xs" color="ink3" style={{ letterSpacing: 1.26, paddingVertical: 12 }}>
          nothing to convert · settings are still updated
        </CapsLabel>
      )}
    </SheetLayout>
  );
}
