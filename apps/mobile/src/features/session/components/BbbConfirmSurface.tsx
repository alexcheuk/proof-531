/**
 * BBB confirm fork phase surface (W2.4).
 *
 * Renders after the terminal main-work set's rest period and asks the user
 * whether they're logging Boring But Big or skipping it. Composes existing
 * design primitives — `Text` + `PlateBar` — plus a feature-local split CTA
 * that mirrors the W1.3 working-set split (filled primary / outlined
 * secondary, two `Pressable`s in a flex row).
 *
 * Pure presentational. The caller (`LiveScreen`) wires the two callbacks
 * to `useLiveScreenState.onConfirmBbb` / `onSkipBbb` which respectively
 * write 5 `kind:'bbb'` rows + complete, or just complete.
 *
 * Boundary: hex / px live in `src/design/tokens.ts` only — this file pulls
 * everything from `useTheme()`.
 */
import { PlateBar } from '@/design/primitives/PlateBar';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';
import { Pressable, Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';

export type BbbConfirmSurfaceProps = {
  /** Display weight per set (5 × 10 reps at this weight). */
  bbbWeight: number;
  /** Display unit (`'lbs' | 'kg'`). */
  unit: Unit;
  /** Pre-computed plate decomposition for `bbbWeight`, heaviest first. */
  perSide: readonly number[];
  onConfirm: () => void;
  onSkip: () => void;
  testID?: string;
};

export function BbbConfirmSurface({
  bbbWeight,
  unit,
  perSide,
  onConfirm,
  onSkip,
  testID,
}: BbbConfirmSurfaceProps) {
  const { colors, radii, spacing, type } = useTheme();
  const unitGlyph = displayUnit(unit);

  const headerWrap: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  };
  const eyebrowStyle: TextStyle = {
    textTransform: 'uppercase',
    letterSpacing: 2.2,
    marginBottom: spacing.sm,
  };
  const headlineStyle: TextStyle = {
    fontFamily: `${type.sans}-Medium`,
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -1.44,
    color: colors.ink0,
  };
  const subParaStyle: TextStyle = {
    fontFamily: `${type.sans}-Regular`,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink2,
    marginTop: spacing.md,
    maxWidth: 320,
  };
  const plateWrap: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  };
  const splitRow: ViewStyle = {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  };
  const primaryButtonStyle: ViewStyle = {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.ink0,
    borderRadius: radii.pill,
  };
  const secondaryButtonStyle: ViewStyle = {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg0,
    borderWidth: 1,
    borderColor: colors.ink0,
    borderRadius: radii.pill,
  };

  const accessibilityConfirm = `Log Boring But Big, 5 sets of 10 reps at ${bbbWeight} ${unitGlyph}`;

  return (
    <View testID={testID ?? 'bbb-confirm-surface'}>
      <View style={headerWrap}>
        <Text
          variant="mono"
          weight="semibold"
          size={10}
          color="ink2"
          style={eyebrowStyle}
          testID="bbb-confirm-eyebrow"
        >
          MAIN WORK · DONE
        </Text>
        <RNText style={headlineStyle} accessibilityRole="header" testID="bbb-confirm-headline">
          Boring But Big?
        </RNText>
        <Text
          variant="sans"
          weight="regular"
          size={14}
          color="ink2"
          style={subParaStyle}
          testID="bbb-confirm-sub"
        >
          5 sets of 10 at {bbbWeight} {unitGlyph}. Optional assistance — log it if you do it.
        </Text>
      </View>
      <View style={plateWrap}>
        <PlateBar
          perSide={perSide}
          unitGlyph={unitGlyph}
          weight={bbbWeight}
          mini
          testID="bbb-confirm-plate-bar"
        />
      </View>
      <View style={splitRow}>
        <Pressable
          testID="cta-bbb-confirm"
          accessibilityRole="button"
          accessibilityLabel={accessibilityConfirm}
          onPress={onConfirm}
          style={primaryButtonStyle}
        >
          <Text
            variant="sans"
            weight="semibold"
            size={15}
            color="bg0"
            style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
          >
            Logged it
          </Text>
          <Text variant="mono" weight="bold" size={13} color="bg0">
            ✓
          </Text>
        </Pressable>
        <Pressable
          testID="cta-bbb-skip"
          accessibilityRole="button"
          accessibilityLabel="Skip Boring But Big and finish session"
          onPress={onSkip}
          style={secondaryButtonStyle}
        >
          <Text
            variant="sans"
            weight="semibold"
            size={13}
            color="ink0"
            style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
          >
            Skip BBB
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
