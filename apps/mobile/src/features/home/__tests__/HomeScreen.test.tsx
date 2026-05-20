import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type React from 'react';
import { HomeScreen, type HomeScreenProps } from '../HomeScreen';

const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const baseProps: HomeScreenProps = {
  greeting: 'Good morning',
  cycleStatus: { kind: 'active', cycle: 1, week: 2 },
  lifts: [
    {
      id: 'squat',
      label: 'Squat',
      trainingMax: 315,
      topWeight: 270,
      topReps: 3,
      amrap: true,
      pct: 0.85,
    },
    {
      id: 'bench',
      label: 'Bench',
      trainingMax: 225,
      topWeight: 190,
      topReps: 3,
      amrap: true,
      pct: 0.85,
    },
    {
      id: 'deadlift',
      label: 'Deadlift',
      trainingMax: 405,
      topWeight: 345,
      topReps: 3,
      amrap: true,
      pct: 0.85,
    },
    {
      id: 'press',
      label: 'Press',
      trainingMax: 135,
      topWeight: 115,
      topReps: 3,
      amrap: true,
      pct: 0.85,
    },
  ],
  unit: 'lbs',
  completedSessions: 6,
};

describe('HomeScreen', () => {
  it('renders greeting, hero, cycle pill, grid, stats', () => {
    const { getByText, getByTestId } = wrap(<HomeScreen {...baseProps} />);
    expect(getByText('Good morning')).toBeTruthy();
    expect(getByText(/Pick a lift/)).toBeTruthy();
    expect(getByText(/Press start/)).toBeTruthy();
    expect(getByTestId('cycle-status-pill')).toBeTruthy();
    expect(getByTestId('lift-picker-grid')).toBeTruthy();
    expect(getByTestId('stats-card-cycle')).toBeTruthy();
    expect(getByTestId('stats-card-active-lifts')).toBeTruthy();
  });

  it('single-lift mode renders one full-width card and still uses the grid container', () => {
    const props: HomeScreenProps = {
      ...baseProps,
      lifts: [
        {
          id: 'bench',
          label: 'Bench',
          trainingMax: 225,
          topWeight: 190,
          topReps: 3,
          amrap: true,
          pct: 0.85,
        },
      ],
    };
    const { getByTestId, getByText } = wrap(<HomeScreen {...props} />);
    expect(getByTestId('lift-picker-grid')).toBeTruthy();
    expect(getByTestId('lift-picker-card-bench')).toBeTruthy();
    expect(getByText('Bench')).toBeTruthy();
  });

  it('renders recent ember notice when provided', () => {
    const props: HomeScreenProps = {
      ...baseProps,
      recentNotice: {
        title: '+10 deadlift training max',
        subline: 'cycle 1 cleared — keep going.',
      },
    };
    const { getByTestId, getByText } = wrap(<HomeScreen {...props} />);
    expect(getByTestId('home-recent-notice')).toBeTruthy();
    expect(getByText('+10 deadlift training max')).toBeTruthy();
  });

  it('does not render recent notice when absent', () => {
    const { queryByTestId } = wrap(<HomeScreen {...baseProps} />);
    expect(queryByTestId('home-recent-notice')).toBeNull();
  });

  it('lift press calls onLiftPress with id', () => {
    const onLiftPress = jest.fn();
    const { getByTestId } = wrap(<HomeScreen {...baseProps} onLiftPress={onLiftPress} />);
    fireEvent.press(getByTestId('lift-picker-card-squat'));
    expect(onLiftPress).toHaveBeenCalledWith('squat');
  });

  it('freshStart cycle pill renders without crashing', () => {
    const props: HomeScreenProps = { ...baseProps, cycleStatus: { kind: 'freshStart' } };
    const { getByTestId } = wrap(<HomeScreen {...props} />);
    expect(getByTestId('cycle-status-pill')).toBeTruthy();
  });

  it('active cycle pill shows compound C/W badge', () => {
    const props: HomeScreenProps = {
      ...baseProps,
      cycleStatus: { kind: 'active', cycle: 2, week: 3 },
    };
    const { getByText } = wrap(<HomeScreen {...props} />);
    expect(getByText('C2 · W3')).toBeTruthy();
  });
});
