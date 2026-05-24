import { NumberStepper } from '@/design/primitives/NumberStepper';
import { Sheet } from '@/design/primitives/Sheet';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
/**
 * Bottom-sheet AMRAP rep logger.
 *
 * W2.3 additions:
 *   - Preset chip row above the stepper ([5][8][10][12][15], or
 *     [5][8][10][12][15] on iPhone-SE-class widths; [3] dropped at <360pt).
 *   - Promoted PR row below the chips that appears when the user crosses the
 *     PR threshold via chip-or-stepper.
 *
 * Parent owns the actual `appendSetLog` call — this component only stages reps
 * and surfaces an e1RM caption.
 */
import { motion as motionTokens } from '@/design/tokens';
import { estimateOneRm } from '@/domain/epley';
import { liftDisplayName } from '@/domain/labels';
import type { Lift, Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Pressable,
  Text as RNText,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export type AmrapLogSheetProps = {
  open: boolean;
  lift: Lift;
  prescribedWeight: number;
  prescribedReps: number;
  unit: Unit;
  existingBestE1RM?: number | undefined;
  onCancel: () => void;
  onSave: (reps: number) => void;
  testID?: string | undefined;
};

/**
 * Preset chips shown above the stepper. Six entries at >= 360pt; five at
 * narrower widths (drop the [3] chip — least common AMRAP rep count). Static,
 * not responsive within a session.
 */
const PRESET_REPS_WIDE = [3, 5, 8, 10, 12, 15] as const;
const PRESET_REPS_NARROW = [5, 8, 10, 12, 15] as const;
const NARROW_BREAKPOINT_PT = 360;

export function AmrapLogSheet({
  open,
  lift,
  prescribedWeight,
  prescribedReps,
  unit,
  existingBestE1RM,
  onCancel,
  onSave,
  testID,
}: AmrapLogSheetProps) {
  const [reps, setReps] = useState<number>(prescribedReps);
  const [pending, setPending] = useState(false);
  // W2.3 — chip tracks the user's last-selected chip value, distinct from
  // `reps` because the stepper can drift away from the chip via ±. `null`
  // means "no chip selected" (either never selected, or stepper-overridden).
  const [selectedChipValue, setSelectedChipValue] = useState<number | null>(null);
  const { colors, spacing, radii, type } = useTheme();

  function handleSave() {
    setPending(true);
    onSave(reps);
  }

  function handleSelectChip(value: number) {
    Haptics.selectionAsync();
    setReps(value);
    setSelectedChipValue(value);
  }

  function handleStepperChange(value: number) {
    setReps(value);
    // Any stepper input clears chip selection — the user is now off-grid.
    setSelectedChipValue(null);
  }

  const predictedE1RMRaw = estimateOneRm(prescribedWeight, reps);
  const predictedE1RM = Math.round(predictedE1RMRaw);
  const isPotentialPR = predictedE1RMRaw > (existingBestE1RM ?? 0);
  const showPRRow = isPotentialPR && reps > 0;

  // W3-C — PR row height tween. Spec calls for `prRowHeight = useSharedValue(0)`
  // tweened to 40 on cross-into-PR (via stepper or chip), back to 0 on
  // cross-out. The reduced-motion fallback (`useReducedMotion()`) is the
  // existing instant show/hide — preserved by snapping the shared value to
  // the target without `withTiming`. The wrapper has `overflow: 'hidden'` so
  // clipped content during the tween doesn't leak beyond the band.
  const prRowHeight = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    const target = showPRRow ? 40 : 0;
    if (reduceMotion) {
      prRowHeight.value = target;
      return;
    }
    prRowHeight.value = withTiming(target, {
      duration: motionTokens.durationBase,
      easing: Easing.bezier(...motionTokens.easeStandardBezier),
    });
  }, [showPRRow, reduceMotion, prRowHeight]);
  const prAnimatedStyle = useAnimatedStyle(() => ({
    height: prRowHeight.value,
    overflow: 'hidden',
  }));

  // Width detection — static per sheet mount per spec. iPhone SE 1st gen is
  // 320pt; anything < 360 collapses to the 5-chip layout.
  const screenWidth = Dimensions.get('window').width;
  const presetReps = screenWidth < NARROW_BREAKPOINT_PT ? PRESET_REPS_NARROW : PRESET_REPS_WIDE;

  const bodyStyle: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  };
  const headerRow: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  };
  const chipsRow: ViewStyle = {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  };
  const chipBase: ViewStyle = {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.ink0,
    backgroundColor: colors.bg0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  };
  const chipSelected: ViewStyle = {
    backgroundColor: colors.ink0,
  };
  const chipLabel: TextStyle = {
    fontFamily: `${type.sans}-Medium`,
    fontSize: 18,
    lineHeight: 22,
    color: colors.ink0,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };
  const chipLabelSelected: TextStyle = {
    color: colors.bg0,
  };
  const prRow: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.ink0,
    marginHorizontal: -spacing.xl,
    height: '100%',
  };
  // W3-C — outer wrapper takes the animated height (0..40 via withTiming).
  // marginBottom is gated on `showPRRow` so the band's natural rhythm
  // collapses when the PR row is fully hidden.
  const prRowOuterStyle: ViewStyle = {
    marginBottom: showPRRow ? spacing.lg : 0,
  };
  const prLeftStyle: TextStyle = {
    fontFamily: `${type.mono}-Bold`,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.bg0,
  };
  const prRightStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 12,
    lineHeight: 14,
    color: colors.bg0,
  };
  const footerRow: ViewStyle = {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  };
  const button = (variant: 'primary' | 'ghost'): ViewStyle => ({
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: variant === 'primary' ? colors.ink0 : 'transparent',
    borderWidth: 1,
    borderColor: colors.ink0,
  });

  return (
    <Sheet open={open} onDismiss={onCancel} {...(testID !== undefined ? { testID } : {})}>
      <View style={bodyStyle}>
        <View style={headerRow}>
          <View>
            <Text
              variant="mono"
              weight="semibold"
              size={10}
              color="ink2"
              style={{ textTransform: 'uppercase', letterSpacing: 2.2 }}
            >
              LOG AMRAP
            </Text>
            <Text variant="sans" weight="medium" size={24} color="ink0">
              {liftDisplayName(lift)}
            </Text>
          </View>
          <Text
            variant="mono"
            weight="semibold"
            size={11}
            color="ink2"
            style={{ textTransform: 'uppercase', letterSpacing: 1.8 }}
          >
            {prescribedWeight} {displayUnit(unit)}
          </Text>
        </View>

        <View style={headerRow}>
          <Text
            variant="mono"
            weight="semibold"
            size={10}
            color="ink2"
            style={{ textTransform: 'uppercase', letterSpacing: 1.5 }}
          >
            HOW MANY REPS?
          </Text>
          <Text
            variant="mono"
            weight="semibold"
            size={10}
            color="ink1"
            style={{ textTransform: 'uppercase', letterSpacing: 1.4 }}
            testID="amrap-e1rm"
          >
            EST. 1RM {predictedE1RM} {displayUnit(unit)}
          </Text>
        </View>

        <View style={chipsRow} testID="amrap-preset-chips">
          {presetReps.map((n) => {
            const isSelected = selectedChipValue === n;
            return (
              <Pressable
                key={n}
                testID={`amrap-chip-${n}`}
                accessibilityRole="button"
                accessibilityLabel={`${n} reps`}
                accessibilityState={{ selected: isSelected }}
                onPress={() => handleSelectChip(n)}
                style={[chipBase, isSelected ? chipSelected : null]}
              >
                <RNText style={[chipLabel, isSelected ? chipLabelSelected : null]}>{n}</RNText>
              </Pressable>
            );
          })}
        </View>

        <Animated.View
          style={[prAnimatedStyle, prRowOuterStyle]}
          // The Animated.View carries the testID so existing tests that
          // assert presence with `queryByTestId('amrap-pr-row')` see "present"
          // only when `showPRRow` (height > 0). When hidden the height is 0,
          // overflow:'hidden' clips child content, and the testID resolves
          // to a node with no visible content — which still resolves to
          // truthy in the registry. Wave 2's tests therefore key off
          // `showPRRow` semantics; we keep the testID on the inner View when
          // the PR is genuinely active, gated on `showPRRow`, so the
          // existing assertions stay correct.
          testID={showPRRow ? 'amrap-pr-row-wrapper' : 'amrap-pr-row-wrapper-hidden'}
        >
          {showPRRow ? (
            <View
              style={prRow}
              accessibilityRole="alert"
              accessibilityLabel={`Personal record, estimated 1 rep max ${predictedE1RM} ${displayUnit(unit)}`}
              testID="amrap-pr-row"
            >
              <RNText style={prLeftStyle}>★ NEW PERSONAL RECORD</RNText>
              <RNText style={prRightStyle}>
                EST. 1RM {predictedE1RM} {displayUnit(unit)}
              </RNText>
            </View>
          ) : null}
        </Animated.View>

        <NumberStepper
          value={reps}
          onChange={handleStepperChange}
          min={0}
          max={30}
          step={1}
          accessibilityLabelDecrement="Decrease reps"
          accessibilityLabelIncrement="Increase reps"
          testID="amrap-reps-stepper"
        />

        <View style={footerRow}>
          <Pressable
            testID="amrap-cancel"
            accessibilityRole="button"
            disabled={pending}
            onPress={onCancel}
            style={button('ghost')}
          >
            <Text
              variant="sans"
              weight="semibold"
              size={13}
              color="ink0"
              style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
            >
              Cancel
            </Text>
          </Pressable>
          <Pressable
            testID="amrap-save"
            accessibilityRole="button"
            disabled={pending}
            onPress={handleSave}
            style={button('primary')}
          >
            <Text
              variant="sans"
              weight="semibold"
              size={13}
              color="bg0"
              style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
            >
              Save
            </Text>
          </Pressable>
        </View>
      </View>
    </Sheet>
  );
}
