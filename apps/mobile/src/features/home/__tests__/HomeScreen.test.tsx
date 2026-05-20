import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type React from 'react';
import { HomeScreen, type HomeScreenProps } from '../HomeScreen';

const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const baseProps: HomeScreenProps = {
  greeting: 'Good morning',
  headline: 'Time to lift.',
  cycleStatus: { kind: 'active', cycle: 1, week: 2 },
  lifts: [
    { id: 'squat', label: 'Squat', trainingMax: 315 },
    { id: 'bench', label: 'Bench', trainingMax: 225 },
    { id: 'deadlift', label: 'Deadlift', trainingMax: 405 },
    { id: 'press', label: 'Press', trainingMax: 135 },
  ],
  stats: { prs: 3, sessions: 6, daysLifted: 12 },
};

describe('HomeScreen', () => {
  it('renders greeting, headline, cycle pill, grid, stats', () => {
    const { getByText, getByTestId } = wrap(<HomeScreen {...baseProps} />);
    expect(getByText('Good morning')).toBeTruthy();
    expect(getByText('Time to lift.')).toBeTruthy();
    expect(getByTestId('cycle-status-pill')).toBeTruthy();
    expect(getByTestId('lift-picker-grid')).toBeTruthy();
    expect(getByTestId('stats-row')).toBeTruthy();
  });

  it('single-lift mode renders one full-width card and no grid', () => {
    const props: HomeScreenProps = {
      ...baseProps,
      lifts: [{ id: 'bench', label: 'Bench', trainingMax: 225 }],
    };
    const { queryByTestId, getByTestId, getByText } = wrap(<HomeScreen {...props} />);
    expect(queryByTestId('lift-picker-grid')).toBeNull();
    expect(getByTestId('lift-single')).toBeTruthy();
    expect(getByText('Bench')).toBeTruthy();
  });

  it('justAdvanced status shows the progression notice', () => {
    const props: HomeScreenProps = {
      ...baseProps,
      cycleStatus: { kind: 'justAdvanced', fromCycle: 1, toCycle: 2 },
    };
    const { getByText, getByTestId } = wrap(<HomeScreen {...props} />);
    expect(getByTestId('last-cycle-notice')).toBeTruthy();
    expect(getByText(/Cycle 1 complete/)).toBeTruthy();
  });

  it('does not render progression notice when active', () => {
    const { queryByTestId } = wrap(<HomeScreen {...baseProps} />);
    expect(queryByTestId('last-cycle-notice')).toBeNull();
  });

  it('lift press calls onLiftPress with id', () => {
    const onLiftPress = jest.fn();
    const { getByText } = wrap(<HomeScreen {...baseProps} onLiftPress={onLiftPress} />);
    fireEvent.press(getByText('Squat'));
    expect(onLiftPress).toHaveBeenCalledWith('squat');
  });

  it('freshStart cycle pill shows "Fresh start"', () => {
    const props: HomeScreenProps = { ...baseProps, cycleStatus: { kind: 'freshStart' } };
    const { getByText } = wrap(<HomeScreen {...props} />);
    expect(getByText('Fresh start')).toBeTruthy();
  });

  it('active cycle pill shows cycle and week', () => {
    const props: HomeScreenProps = {
      ...baseProps,
      cycleStatus: { kind: 'active', cycle: 2, week: 3 },
    };
    const { getByText } = wrap(<HomeScreen {...props} />);
    expect(getByText('Cycle 2 · Week 3')).toBeTruthy();
  });
});
