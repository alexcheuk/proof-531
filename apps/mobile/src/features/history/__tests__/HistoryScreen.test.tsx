import { ThemeProvider } from '@/design/theme';
import { fireEvent, render, within } from '@testing-library/react-native';
import type React from 'react';
import { HistoryScreen, type HistoryScreenProps } from '../HistoryScreen';
import type { HistorySession } from '../HistorySessionRow';

const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const sessions: HistorySession[] = [
  {
    id: 1,
    completedAt: new Date('2026-05-14T12:00:00Z'),
    liftId: 'squat',
    liftLabel: 'Squat',
    week: 3,
    cycleNumber: 2,
    topWeight: 315,
    topReps: 5,
    amrap: true,
    e1rm: 367,
    isPR: true,
  },
  {
    id: 2,
    completedAt: new Date('2026-05-12T12:00:00Z'),
    liftId: 'bench',
    liftLabel: 'Bench',
    week: 3,
    cycleNumber: 2,
    topWeight: 225,
    topReps: 6,
    amrap: true,
    e1rm: 270,
    isPR: false,
  },
  {
    id: 3,
    completedAt: new Date('2026-05-09T12:00:00Z'),
    liftId: 'squat',
    liftLabel: 'Squat',
    week: 2,
    cycleNumber: 2,
    topWeight: 295,
    topReps: 3,
    amrap: false,
    e1rm: 322,
    isPR: false,
  },
];

const baseProps: HistoryScreenProps = {
  history: sessions,
  unit: 'lbs',
  enabledLifts: [
    { id: 'squat', label: 'Squat' },
    { id: 'bench', label: 'Bench' },
  ],
};

describe('HistoryScreen', () => {
  it('renders title, filter, and one row per session', () => {
    const { getByText, getByTestId, getAllByTestId } = wrap(<HistoryScreen {...baseProps} />);
    expect(getByText('History')).toBeTruthy();
    expect(getByTestId('history-filter')).toBeTruthy();
    expect(getAllByTestId(/^history-row-/)).toHaveLength(3);
  });

  it('filter options include All plus enabled lifts', () => {
    const { getByTestId } = wrap(<HistoryScreen {...baseProps} />);
    const filter = within(getByTestId('history-filter'));
    expect(filter.getByText('All')).toBeTruthy();
    expect(filter.getByText('Squat')).toBeTruthy();
    expect(filter.getByText('Bench')).toBeTruthy();
  });

  it('selecting Bench filters list to bench-only rows', () => {
    const { getByTestId, getAllByTestId } = wrap(<HistoryScreen {...baseProps} />);
    const filter = within(getByTestId('history-filter'));
    fireEvent.press(filter.getByText('Bench'));
    const rows = getAllByTestId(/^history-row-/);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.props.testID).toBe('history-row-2');
  });

  it('renders PR badge only for sessions with isPR=true', () => {
    const { getAllByText } = wrap(<HistoryScreen {...baseProps} />);
    expect(getAllByText('PR')).toHaveLength(1);
  });

  it('omits PR badge entirely when no session is a PR', () => {
    const noPRs = sessions.map((s) => ({ ...s, isPR: false }));
    const { queryByText } = wrap(<HistoryScreen {...baseProps} history={noPRs} />);
    expect(queryByText('PR')).toBeNull();
  });
});
