import type { LiftGoalKind } from '@/data/accessors/liftGoal';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { useTheme } from '@/design/theme';
import { cycleGoalEstimate } from '@/domain/progression';
import * as Haptics from 'expo-haptics';
import { Pressable, Text as RNText, View, type ViewStyle } from 'react-native';

export type GoalPanelProps = {
  kind: LiftGoalKind;
  /** Current goal value (display units). */
  value: number;
  unitGlyph: 'lb' | 'kg';
  /** Plate step for the stepper (5 lb / 2.5 kg etc.). */
  step: number;
  /** Minimum the stepper allows (typically `currentTm + tmStep`). */
  minValue: number;
  /** Cycles until projected TM reaches goal. `0` = already past. `null` = unreachable in lookahead. */
  cyclesUntilGoal: number | null;
  /**
   * User's expected workout days per week for THIS lift. `null` = unset.
   * Drives the secondary "≈ N mo at K/wk" estimate next to the days-left
   * figure; without it we render days-only.
   */
  daysPerWeek: number | null;
  onKindChange: (kind: LiftGoalKind) => void;
  onValueChange: (value: number) => void;
  onDaysPerWeekChange: (daysPerWeek: number | null) => void;
  /** `true` when no goal is persisted yet — value is a default placeholder. Steppers create the goal on first tap. */
  unset?: boolean;
  testID?: string;
};

export function GoalPanel({
  kind,
  value,
  unitGlyph,
  step,
  minValue,
  cyclesUntilGoal,
  daysPerWeek,
  onKindChange,
  onValueChange,
  onDaysPerWeekChange,
  unset,
  testID,
}: GoalPanelProps) {
  const { colors, layout, type } = useTheme();

  const onStep = (delta: number) => {
    void Haptics.selectionAsync();
    const next = Math.max(minValue, value + delta);
    onValueChange(next);
  };
  const dec = () => onStep(-step);
  const inc = () => onStep(step);

  const { days: daysApprox, months: monthsApprox } = cycleGoalEstimate(
    cyclesUntilGoal,
    daysPerWeek,
  );
  const dpw = daysPerWeek && daysPerWeek > 0 ? daysPerWeek : null;

  const onDaysPerWeekStep = (delta: number) => {
    void Haptics.selectionAsync();
    const current = dpw ?? 0;
    const next = current + delta;
    if (next <= 0) {
      onDaysPerWeekChange(null);
      return;
    }
    onDaysPerWeekChange(Math.min(7, next));
  };

  const cardStyle: ViewStyle = {
    marginHorizontal: layout.gutter - 8,
    marginTop: 22,
    borderWidth: 1,
    borderColor: colors.ink0,
  };

  const toggleRowStyle: ViewStyle = { flexDirection: 'row' };
  const toggleBtnBase: ViewStyle = {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.ink0,
  };

  return (
    <View style={cardStyle} testID={testID}>
      <View style={toggleRowStyle}>
        {(['tm', '1rm'] as const).map((k, i) => {
          const on = kind === k;
          return (
            <Pressable
              key={k}
              testID={`${testID ?? 'goal-panel'}-tab-${k}`}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`Goal ${k === 'tm' ? 'training max' : 'one-rep max'}`}
              onPress={() => {
                void Haptics.selectionAsync();
                onKindChange(k);
              }}
              style={{
                ...toggleBtnBase,
                borderLeftWidth: i > 0 ? 1 : 0,
                borderLeftColor: colors.ink0,
                backgroundColor: on ? colors.ink0 : 'transparent',
              }}
            >
              <CapsLabel weight="semibold" color={on ? 'bg0' : 'ink2'}>
                {`Goal · ${k === 'tm' ? 'training max' : 'one-rep max'}`}
              </CapsLabel>
            </Pressable>
          );
        })}
      </View>

      <View
        style={{
          paddingVertical: 18,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <StepperBtn
          glyph="−"
          size="lg"
          onPress={dec}
          disabled={value <= minValue}
          testID={`${testID ?? 'goal-panel'}-dec`}
        />
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'center',
          }}
        >
          <RNText
            style={{
              fontFamily: `${type.sans}-Bold`,
              fontSize: 56,
              color: unset ? colors.ink2 : colors.ink0,
              letterSpacing: -2.52,
              // rn-line-height-ok: digit-only display (tabular-nums); '—' fallback
              lineHeight: 56,
              fontVariant: ['tabular-nums', 'lining-nums'],
            }}
          >
            {value > 0 ? String(value) : '—'}
          </RNText>
          <RNText
            style={{
              fontFamily: `${type.mono}-SemiBold`,
              fontSize: 12,
              letterSpacing: 2.64,
              textTransform: 'uppercase',
              color: colors.ink2,
              marginLeft: 10,
            }}
          >
            {unitGlyph}
          </RNText>
        </View>
        <StepperBtn glyph="+" size="lg" onPress={inc} testID={`${testID ?? 'goal-panel'}-inc`} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          paddingVertical: 11,
          paddingHorizontal: 16,
          borderTopWidth: 1,
          borderTopColor: colors.lineStrong,
        }}
      >
        <CapsLabel weight="bold" color="ink0">
          {unset
            ? 'tap to set a goal'
            : cyclesUntilGoal === null
              ? 'beyond horizon'
              : cyclesUntilGoal === 0
                ? 'already past goal'
                : `~${daysApprox} day${daysApprox === 1 ? '' : 's'} away`}
        </CapsLabel>
        <CapsLabel testID={`${testID ?? 'goal-panel'}-estimate`} color="ink3">
          {!unset && monthsApprox !== null && dpw !== null
            ? `≈ ${monthsApprox} mo at ${dpw}/wk`
            : ''}
        </CapsLabel>
      </View>
      {!unset ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderTopWidth: 1,
            borderTopColor: colors.lineStrong,
            gap: 12,
          }}
          testID={`${testID ?? 'goal-panel'}-dpw-row`}
        >
          <CapsLabel weight="bold" color="ink0" style={{ flex: 1 }}>
            Est. work days / week
          </CapsLabel>
          <StepperBtn
            glyph="−"
            size="sm"
            onPress={() => onDaysPerWeekStep(-1)}
            disabled={dpw === null}
            testID={`${testID ?? 'goal-panel'}-dpw-dec`}
          />
          <RNText
            testID={`${testID ?? 'goal-panel'}-dpw-value`}
            style={{
              fontFamily: `${type.mono}-Bold`,
              fontSize: 14,
              color: dpw === null ? colors.ink2 : colors.ink0,
              minWidth: 22,
              textAlign: 'center',
              fontVariant: ['tabular-nums', 'lining-nums'],
            }}
          >
            {dpw !== null ? String(dpw) : '—'}
          </RNText>
          <StepperBtn
            glyph="+"
            size="sm"
            onPress={() => onDaysPerWeekStep(+1)}
            disabled={dpw !== null && dpw >= 7}
            testID={`${testID ?? 'goal-panel'}-dpw-inc`}
          />
        </View>
      ) : null}
    </View>
  );
}

function StepperBtn({
  glyph,
  size,
  onPress,
  disabled,
  testID,
}: {
  glyph: '−' | '+';
  size: 'lg' | 'sm';
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}) {
  const { colors, type } = useTheme();
  const dim = size === 'lg' ? 44 : 28;
  const fontSize = size === 'lg' ? 20 : 14;
  const isDisabled = disabled ?? false;
  const label =
    glyph === '+'
      ? size === 'lg'
        ? 'Increase goal'
        : 'Increase days per week'
      : size === 'lg'
        ? 'Decrease goal'
        : 'Decrease days per week';
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={isDisabled ? { disabled: true } : undefined}
      style={{
        width: dim,
        height: dim,
        borderWidth: 1,
        borderColor: isDisabled ? colors.line : colors.ink0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg0,
      }}
    >
      <RNText
        style={{
          fontFamily: `${type.mono}-Bold`,
          fontSize,
          color: isDisabled ? colors.ink3 : colors.ink0,
          lineHeight: fontSize,
        }}
      >
        {glyph}
      </RNText>
    </Pressable>
  );
}
