import { PillChip } from '@/design/primitives/PillChip';
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import type { Lift } from '@/domain/types';
import { ScrollView } from 'react-native';
import { type HistoryFilter, historyFilterKey } from '../filter';

/**
 * Horizontal chip row above the History ledger.
 *
 * Renders `All`, `PRs`, plus one chip per enabled lift. Scrollable so the
 * chip set grows gracefully (and stays usable on narrow screens). A
 * trailing `✕ Clear` ghost chip appears whenever a non-All filter is
 * active. Pure presentational  -  the parent owns the active filter state.
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

function filterA11yLabel(filter: HistoryFilter): string {
  switch (filter.kind) {
    case 'all':
      return 'Show all sessions';
    case 'prs':
      return 'Show only personal record sessions';
    case 'lift':
      return `Filter to ${LIFT_LABEL[filter.lift]} sessions`;
  }
}

export function FilterChips({ enabledLifts, active, onChange, hidePrChip }: FilterChipsProps) {
  const { layout } = useTheme();
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
      contentContainerStyle={{
        paddingHorizontal: layout.gutter,
        paddingTop: 16,
        paddingBottom: 4,
      }}
      testID="history-filter-chips"
    >
      <Row gap="sm">
        {chips.map(({ filter, label }) => (
          <PillChip
            key={historyFilterKey(filter)}
            label={label}
            selected={historyFilterKey(active) === historyFilterKey(filter)}
            onPress={() => onChange(filter)}
            testID={`history-filter-${historyFilterKey(filter)}`}
            accessibilityLabel={filterA11yLabel(filter)}
          />
        ))}
        {isFiltered ? (
          <PillChip
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
