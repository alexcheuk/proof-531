import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { tmIncrement } from '@/domain/increments';
import type { Lift, Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';
/**
 * One row in the Step 2 lift-picker. Tap anywhere on the row to toggle.
 * Ported from `the PWA reference`.
 */
import { Pressable, View, type ViewStyle } from 'react-native';
import { LIFT_META } from '../lifts';

export interface LiftToggleRowProps {
  lift: Lift;
  /** 0-based index, used for the right-aligned `01..04` label. */
  index: number;
  isFirst: boolean;
  isLast: boolean;
  selected: boolean;
  /** Live wizard unit (Intro's SegRail). Drives both the bump magnitude
   *  and the rendered token. */
  unit: Unit;
  onToggle: () => void;
  testID?: string;
}

export function LiftToggleRow({
  lift,
  index,
  isFirst,
  isLast,
  selected,
  unit,
  onToggle,
  testID,
}: LiftToggleRowProps) {
  const { colors } = useTheme();
  const meta = LIFT_META[lift];
  const isLower = lift === 'squat' || lift === 'deadlift';
  const bump = tmIncrement(unit, lift);
  const description = isLower
    ? `+${bump} ${displayUnit(unit)} / cycle · lower`
    : `+${bump} ${displayUnit(unit)} / cycle · upper`;

  const rowStyle: ViewStyle = {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderTopWidth: 1,
    borderTopColor: isFirst ? colors.lineStrong : colors.line,
    borderBottomWidth: isLast ? 1 : 0,
    borderBottomColor: colors.lineStrong,
    gap: 14,
    backgroundColor: 'transparent',
  };

  const boxStyle: ViewStyle = {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: colors.ink0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: selected ? colors.ink0 : 'transparent',
  };

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${meta.label}, ${description}${selected ? ', selected' : ''}`}
      testID={testID ?? `lift-toggle-${lift}`}
      style={rowStyle}
    >
      <View style={boxStyle}>
        {selected ? (
          <Text variant="sans" weight="bold" size={10} color="bg0">
            ✓
          </Text>
        ) : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="sans" weight="semibold" size={17} color="ink0">
          {meta.label}
        </Text>
        <CapsLabel size="xs" style={{ marginTop: 3 }}>
          {description}
        </CapsLabel>
      </View>
      <CapsLabel weight="bold" color="ink3">
        {String(index + 1).padStart(2, '0')}
      </CapsLabel>
    </Pressable>
  );
}
