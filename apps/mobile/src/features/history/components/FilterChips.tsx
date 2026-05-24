import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import type { Lift } from '@/domain/types';
import {
  Pressable,
  Text as RNText,
  ScrollView,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { type HistoryFilter, historyFilterKey } from '../filter';

/**
 * Horizontal chip row above the History ledger.
 *
 * Renders `All`, `PRs`, plus one chip per enabled lift. Scrollable so the
 * chip set grows gracefully (and stays usable on narrow screens). Pure
 * presentational — the parent owns the active filter state.
 */
export type FilterChipsProps = {
  enabledLifts: ReadonlyArray<Lift>;
  active: HistoryFilter;
  onChange: (filter: HistoryFilter) => void;
  /** When true, the `PRs` chip is hidden. Useful when no PR exists yet. */
  hidePrChip?: boolean;
};

const LIFT_LABEL: Record<Lift, string> = {
  squat: 'Squat',
  bench: 'Bench',
  deadlift: 'Deadlift',
  press: 'Press',
};

export function FilterChips({ enabledLifts, active, onChange, hidePrChip }: FilterChipsProps) {
  const chips: Array<{ filter: HistoryFilter; label: string }> = [
    { filter: { kind: 'all' }, label: 'All' },
  ];
  if (!hidePrChip) {
    chips.push({ filter: { kind: 'prs' }, label: '★ PRs' });
  }
  for (const lift of enabledLifts) {
    chips.push({ filter: { kind: 'lift', lift }, label: LIFT_LABEL[lift] });
  }

  const isFiltered = active.kind !== 'all';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 4 }}
      testID="history-filter-chips"
    >
      <Row gap="sm">
        {chips.map(({ filter, label }) => (
          <Chip
            key={historyFilterKey(filter)}
            label={label}
            selected={historyFilterKey(active) === historyFilterKey(filter)}
            onPress={() => onChange(filter)}
            testID={`history-filter-${historyFilterKey(filter)}`}
          />
        ))}
        {isFiltered ? (
          <Chip
            label="✕ Clear"
            selected={false}
            tone="ghost"
            onPress={() => onChange({ kind: 'all' })}
            testID="history-filter-clear"
            accessibilityLabel="Clear filter"
          />
        ) : null}
      </Row>
    </ScrollView>
  );
}

function Chip({
  label,
  selected,
  onPress,
  testID,
  tone = 'default',
  accessibilityLabel,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID: string;
  /** `default` borders + selected-state ink fill; `ghost` is a dashed reset chip. */
  tone?: 'default' | 'ghost';
  accessibilityLabel?: string;
}) {
  const { colors, type } = useTheme();
  const chipStyle: ViewStyle = {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: selected ? colors.ink0 : colors.line,
    backgroundColor: selected ? colors.ink0 : 'transparent',
    ...(tone === 'ghost' ? { borderStyle: 'dashed', borderColor: colors.lineStrong } : {}),
  };
  const labelStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: selected ? colors.bg0 : tone === 'ghost' ? colors.ink1 : colors.ink2,
  };
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? `Filter: ${label}${selected ? ', selected' : ''}`}
      testID={testID}
      style={({ pressed }) => [chipStyle, pressed && !selected ? { opacity: 0.7 } : null]}
    >
      <RNText style={labelStyle}>{label}</RNText>
    </Pressable>
  );
}
