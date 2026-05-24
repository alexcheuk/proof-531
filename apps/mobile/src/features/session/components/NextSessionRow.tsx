/**
 * Wave 3 W3.3 — "Next session" handoff row on `SessionCompleteScreen`.
 *
 * Compact card sitting between the cycle grid and the sticky `CtaBar`, with
 * the next-session computation (lift, week, day, weight × reps) and an
 * outlined "Schedule reminder" stub button. The stub fires a selection
 * haptic and shows a 2-second inline caption ("Reminders coming soon.")
 * but does not write anything — `expo-notifications` integration is out of
 * scope per the spec.
 *
 * Pure presentational. The caller (`SessionCompleteScreen`) feeds the
 * pre-computed display copy + numbers. The `nextSessionPlan` domain helper
 * (`apps/mobile/src/domain/schemes.ts`) is the canonical source for the
 * lift / week / day / topPct / topReps / amrap math.
 *
 * Boundary: hex / px live in `src/design/tokens.ts` only — everything in
 * this file goes through `useTheme()`.
 */
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';

export type NextSessionRowProps = {
  /** Title-case lift label, e.g. "Bench". */
  liftLabel: string;
  /** Next session's week (1..4). */
  week: number;
  /** Next session's day within the cycle (1-based). */
  day: number;
  /** Top-set weight in display units, or `null` if no TM exists for the lift. */
  weight: number | null;
  /** Top-set reps. */
  reps: number;
  /** True if the top set carries the AMRAP flag. */
  amrap: boolean;
  /** Display unit (`'lbs' | 'kg'`). */
  unit: Unit;
  testID?: string;
};

const STUB_CAPTION_VISIBLE_MS = 2000;

export function NextSessionRow({
  liftLabel,
  week,
  day,
  weight,
  reps,
  amrap,
  unit,
  testID,
}: NextSessionRowProps) {
  const { colors, spacing, type } = useTheme();
  const [showStubCaption, setShowStubCaption] = useState(false);
  // Single-shot timeout we can clear on unmount so the state setter doesn't
  // fire against a torn-down component if the user navigates away within the
  // 2-second window.
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current !== null) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const handleStubPress = useCallback(() => {
    Haptics.selectionAsync();
    setShowStubCaption(true);
    if (hideTimerRef.current !== null) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setShowStubCaption(false);
      hideTimerRef.current = null;
    }, STUB_CAPTION_VISIBLE_MS);
  }, []);

  const unitGlyph = displayUnit(unit);
  const hasTm = weight !== null;
  const weightText = hasTm
    ? `${weight} ${unitGlyph} × ${reps}${amrap ? '+' : ''}`
    : `--  ${unitGlyph} × ${reps}${amrap ? '+' : ''}`;

  const sectionWrap: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  };
  const sectionHeaderStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
    marginBottom: spacing.sm,
  };
  const cardStyle: ViewStyle = {
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
  };
  const cardRow1: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: spacing.md,
  };
  const liftNameStyle: TextStyle = {
    fontFamily: `${type.sans}-Medium`,
    fontSize: 24,
    lineHeight: 28,
    color: colors.ink0,
  };
  const weekDayStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
  };
  const weightStyle: TextStyle = {
    fontFamily: `${type.sans}-Medium`,
    fontSize: 20,
    lineHeight: 24,
    color: colors.ink0,
    fontVariant: ['tabular-nums', 'lining-nums'],
    marginTop: spacing.sm,
  };
  const noTmStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.ink3,
    marginTop: spacing.xs,
  };
  const buttonRow: ViewStyle = {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  };
  const stubButtonStyle: ViewStyle = {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.ink0,
    backgroundColor: colors.bg0,
    alignItems: 'center',
    justifyContent: 'center',
  };
  const stubButtonLabelStyle: TextStyle = {
    fontFamily: `${type.sans}-SemiBold`,
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.ink0,
  };
  const stubCaptionStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.ink3,
    marginTop: spacing.sm,
  };

  return (
    <View style={sectionWrap} testID={testID ?? 'next-session-row'}>
      <RNText accessibilityRole="header" style={sectionHeaderStyle}>
        Next session
      </RNText>
      <View style={cardStyle}>
        <View style={cardRow1}>
          <RNText style={liftNameStyle} testID="next-session-row-lift">
            {liftLabel}
          </RNText>
          <RNText style={weekDayStyle} testID="next-session-row-week-day">
            Week {week} · Day {day}
          </RNText>
        </View>
        <RNText style={weightStyle} testID="next-session-row-weight">
          {weightText}
        </RNText>
        {!hasTm ? (
          <RNText style={noTmStyle} testID="next-session-row-no-tm">
            Set a training max first
          </RNText>
        ) : null}
      </View>
      <View style={buttonRow}>
        <Pressable
          testID="next-session-row-schedule-reminder"
          accessibilityRole="button"
          accessibilityLabel="Schedule reminder. Coming soon."
          accessibilityHint="Not yet available."
          onPress={handleStubPress}
          style={stubButtonStyle}
        >
          <Text
            variant="sans"
            weight="semibold"
            size={13}
            color="ink0"
            style={stubButtonLabelStyle}
          >
            Schedule reminder
          </Text>
        </Pressable>
      </View>
      {showStubCaption ? (
        <RNText style={stubCaptionStyle} testID="next-session-row-stub-caption">
          Reminders coming soon.
        </RNText>
      ) : null}
    </View>
  );
}
