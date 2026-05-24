import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { FilterChips } from '../components/FilterChips';
import type { HistoryFilter } from '../filter';

const renderChips = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const ENABLED = ['squat', 'bench', 'deadlift', 'press'] as const;

describe('FilterChips', () => {
  it('renders All + PRs + every enabled lift', () => {
    const { getByTestId } = renderChips(
      <FilterChips enabledLifts={ENABLED} active={{ kind: 'all' }} onChange={() => {}} />,
    );
    expect(getByTestId('history-filter-all')).toBeTruthy();
    expect(getByTestId('history-filter-prs')).toBeTruthy();
    expect(getByTestId('history-filter-lift:squat')).toBeTruthy();
    expect(getByTestId('history-filter-lift:bench')).toBeTruthy();
    expect(getByTestId('history-filter-lift:deadlift')).toBeTruthy();
    expect(getByTestId('history-filter-lift:press')).toBeTruthy();
  });

  it('hides the PRs chip when hidePrChip=true', () => {
    const { queryByTestId } = renderChips(
      <FilterChips
        enabledLifts={ENABLED}
        active={{ kind: 'all' }}
        onChange={() => {}}
        hidePrChip
      />,
    );
    expect(queryByTestId('history-filter-prs')).toBeNull();
  });

  it('does NOT show the Clear chip when filter is "all"', () => {
    const { queryByTestId } = renderChips(
      <FilterChips enabledLifts={ENABLED} active={{ kind: 'all' }} onChange={() => {}} />,
    );
    expect(queryByTestId('history-filter-clear')).toBeNull();
  });

  it('shows the Clear chip whenever a non-all filter is active', () => {
    const { getByTestId } = renderChips(
      <FilterChips
        enabledLifts={ENABLED}
        active={{ kind: 'lift', lift: 'bench' }}
        onChange={() => {}}
      />,
    );
    expect(getByTestId('history-filter-clear')).toBeTruthy();
  });

  it('reflects active filter on the correct chip via accessibilityState', () => {
    const { getByTestId } = renderChips(
      <FilterChips
        enabledLifts={ENABLED}
        active={{ kind: 'lift', lift: 'deadlift' }}
        onChange={() => {}}
      />,
    );
    expect(getByTestId('history-filter-lift:deadlift').props.accessibilityState).toEqual({
      selected: true,
    });
    expect(getByTestId('history-filter-all').props.accessibilityState).toEqual({
      selected: false,
    });
  });

  it('onChange dispatches the chip filter on press', () => {
    const onChange = jest.fn();
    const { getByTestId } = renderChips(
      <FilterChips enabledLifts={ENABLED} active={{ kind: 'all' }} onChange={onChange} />,
    );
    fireEvent.press(getByTestId('history-filter-lift:bench'));
    const arg = onChange.mock.calls[0]?.[0] as HistoryFilter;
    expect(arg).toEqual({ kind: 'lift', lift: 'bench' });
  });

  it('Clear chip dispatches an all filter', () => {
    const onChange = jest.fn();
    const { getByTestId } = renderChips(
      <FilterChips
        enabledLifts={ENABLED}
        active={{ kind: 'lift', lift: 'bench' }}
        onChange={onChange}
      />,
    );
    fireEvent.press(getByTestId('history-filter-clear'));
    expect(onChange).toHaveBeenCalledWith({ kind: 'all' });
  });
});
