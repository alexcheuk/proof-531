import { useTheme } from '@/design/theme';
import { weekLabel } from '@/domain/labels';
import type { Week } from '@/domain/types';
/**
 * Caps-mono strip header: "CYCLE 01 · WEEK 1 · 5/5/5+".
 *
 * Ported from `~/Development/531-pwa/src/features/home/components/CycleStrip.tsx`
 * — the PWA renders a 4-cell ledger grid; the mobile port collapses that
 * down to a single caps line per the PE-03 spec (the grid lives on the
 * dedicated cycle screen, not on Home). Pure presentational.
 */
import { Text as RNText, View, type ViewStyle } from 'react-native';

type CycleStripProps = {
  cycle: number;
  week: Week;
};

export function CycleStrip({ cycle, week }: CycleStripProps) {
  const { colors, type, spacing } = useTheme();

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  };

  const cycleStr = String(cycle).padStart(2, '0');
  const text = `CYCLE ${cycleStr}  ·  WEEK ${week}  ·  ${weekLabel(week)}`;

  return (
    <View style={containerStyle} testID="cycle-strip">
      <RNText
        style={{
          fontFamily: `${type.mono}-Medium`,
          fontSize: 10,
          lineHeight: 10,
          letterSpacing: 1.8,
          textTransform: 'uppercase',
          color: colors.ink2,
        }}
      >
        {text}
      </RNText>
    </View>
  );
}
