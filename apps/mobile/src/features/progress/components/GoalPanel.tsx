import type { LiftGoalKind } from '@/data/accessors/liftGoal';
import { useTheme } from '@/design/theme';
import * as Haptics from 'expo-haptics';
import { Pressable, Text as RNText, View, type ViewStyle } from 'react-native';

/**
 * Bordered card with a TM/1RM toggle, value stepper, and outcome strip.
 * Matches the canonical `GoalPanelV3`.
 *
 * No internal state — fully controlled. The parent owns `kind` + `value`
 * + their setters, threads the mutation, and computes `cyclesUntilGoal`.
 */
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
   * Drives the secondary "≈ K weeks · M mo" estimate next to the days-left
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

  // One 5/3/1 "day" = one session for this lift, and a cycle holds 4 such
  // sessions. So days-until-goal = cycles × 4. When the user has supplied
  // days/week we can also project that out to calendar time.
  const daysApprox = cyclesUntilGoal !== null ? cyclesUntilGoal * 4 : 0;
  const dpw = daysPerWeek && daysPerWeek > 0 ? daysPerWeek : null;
  const weeksApprox =
    dpw !== null && daysApprox > 0 ? Math.max(1, Math.round(daysApprox / dpw)) : 0;
  const monthsApprox = weeksApprox > 0 ? Math.max(1, Math.round(weeksApprox / 4.3)) : 0;

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
              <RNText
                style={{
                  fontFamily: `${type.mono}-SemiBold`,
                  fontSize: 10,
                  letterSpacing: 1.8,
                  textTransform: 'uppercase',
                  color: on ? colors.bg0 : colors.ink2,
                }}
              >
                Goal · {k === 'tm' ? 'training max' : 'one-rep max'}
              </RNText>
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
        <StepperButton glyph="−" onPress={dec} testID={`${testID ?? 'goal-panel'}-dec`} />
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
        <StepperButton glyph="+" onPress={inc} testID={`${testID ?? 'goal-panel'}-inc`} />
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
        <RNText
          style={{
            fontFamily: `${type.mono}-Bold`,
            fontSize: 10,
            letterSpacing: 2.2,
            textTransform: 'uppercase',
            color: colors.ink0,
          }}
        >
          {unset
            ? 'tap to set a goal'
            : cyclesUntilGoal === null
              ? 'beyond horizon'
              : cyclesUntilGoal === 0
                ? 'already past goal'
                : `~${cyclesUntilGoal} cycle${cyclesUntilGoal === 1 ? '' : 's'} away`}
        </RNText>
        <RNText
          testID={`${testID ?? 'goal-panel'}-estimate`}
          style={{
            fontFamily: `${type.mono}-Medium`,
            fontSize: 10,
            letterSpacing: 1.8,
            textTransform: 'uppercase',
            color: colors.ink3,
          }}
        >
          {!unset && cyclesUntilGoal && cyclesUntilGoal > 0 && dpw !== null
            ? `≈ ${weeksApprox} wks · ${monthsApprox}mo`
            : ''}
        </RNText>
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
          <RNText
            style={{
              fontFamily: `${type.mono}-Bold`,
              fontSize: 10,
              letterSpacing: 2.2,
              textTransform: 'uppercase',
              color: colors.ink0,
              flex: 1,
            }}
          >
            Est. work days / week
          </RNText>
          <DaysPerWeekStepper
            glyph="−"
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
          <DaysPerWeekStepper
            glyph="+"
            onPress={() => onDaysPerWeekStep(+1)}
            disabled={dpw !== null && dpw >= 7}
            testID={`${testID ?? 'goal-panel'}-dpw-inc`}
          />
        </View>
      ) : null}
    </View>
  );
}

function DaysPerWeekStepper({
  glyph,
  onPress,
  disabled,
  testID,
}: {
  glyph: '−' | '+';
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}) {
  const { colors, type } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={glyph === '+' ? 'Increase days per week' : 'Decrease days per week'}
      accessibilityState={{ disabled }}
      style={{
        width: 28,
        height: 28,
        borderWidth: 1,
        borderColor: disabled ? colors.line : colors.ink0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg0,
      }}
    >
      <RNText
        style={{
          fontFamily: `${type.mono}-Bold`,
          fontSize: 14,
          color: disabled ? colors.ink3 : colors.ink0,
          lineHeight: 14,
        }}
      >
        {glyph}
      </RNText>
    </Pressable>
  );
}

function StepperButton({
  glyph,
  onPress,
  testID,
}: {
  glyph: '−' | '+';
  onPress: () => void;
  testID?: string;
}) {
  const { colors, type } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={glyph === '+' ? 'Increase goal' : 'Decrease goal'}
      style={{
        width: 44,
        height: 44,
        borderWidth: 1,
        borderColor: colors.ink0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg0,
      }}
    >
      <RNText
        style={{
          fontFamily: `${type.mono}-Bold`,
          fontSize: 20,
          color: colors.ink0,
          lineHeight: 20,
        }}
      >
        {glyph}
      </RNText>
    </Pressable>
  );
}
