import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type React from 'react';
import { CycleScreen, type CycleScreenProps } from '../CycleScreen';

jest.mock('@shopify/react-native-skia', () => {
  const ReactMock = require('react');
  const passthrough = ({ children }: { children?: unknown }) =>
    ReactMock.createElement(ReactMock.Fragment, null, children);
  return {
    Canvas: passthrough,
    Group: passthrough,
    Path: () => null,
    Skia: { Path: { Make: () => ({ addCircle() {}, addArc() {} }) } },
  };
});

const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const lifts = [
  { id: 'squat', label: 'Squat', trainingMax: 275 },
  { id: 'bench', label: 'Bench', trainingMax: 195 },
  { id: 'deadlift', label: 'Deadlift', trainingMax: 345 },
];

const baseProps: CycleScreenProps = {
  cycleNumber: 3,
  weekOfCycle: 2,
  lifts,
  completedSessions: [
    { week: 1, liftId: 'squat' },
    { week: 1, liftId: 'bench' },
    { week: 1, liftId: 'deadlift' },
  ],
  unit: 'lbs',
};

describe('CycleScreen', () => {
  it('renders header, ring, and grid', () => {
    const { getByText, getByTestId } = wrap(<CycleScreen {...baseProps} />);
    expect(getByText('Cycle 3')).toBeTruthy();
    expect(getByTestId('cycle-progress-card')).toBeTruthy();
    expect(getByTestId('progress-ring')).toBeTruthy();
    expect(getByTestId('cycle-grid')).toBeTruthy();
  });

  it('renders 4 × lifts.length cells', () => {
    const { getByTestId } = wrap(<CycleScreen {...baseProps} />);
    for (const w of [1, 2, 3, 4] as const) {
      for (const l of lifts) {
        expect(getByTestId(`cycle-cell-${w}-${l.id}`)).toBeTruthy();
      }
    }
  });

  it('completed cells receive done indicator', () => {
    const { getByTestId } = wrap(<CycleScreen {...baseProps} />);
    expect(getByTestId('cycle-cell-done-1-squat')).toBeTruthy();
  });

  it('week 4 cells are deload without done indicator unless completed', () => {
    const { queryByTestId, getByTestId } = wrap(<CycleScreen {...baseProps} />);
    expect(getByTestId('cycle-cell-4-bench')).toBeTruthy();
    expect(queryByTestId('cycle-cell-done-4-bench')).toBeNull();
  });

  it('onSelectDay fires with (week, liftId) on press', () => {
    const onSelectDay = jest.fn();
    const { getByTestId } = wrap(<CycleScreen {...baseProps} onSelectDay={onSelectDay} />);
    fireEvent.press(getByTestId('cycle-cell-2-bench'));
    expect(onSelectDay).toHaveBeenCalledWith(2, 'bench');
  });

  it('shows progress caption', () => {
    const { getByText } = wrap(<CycleScreen {...baseProps} />);
    expect(getByText('3 of 12 sessions done')).toBeTruthy();
    expect(getByText('Week 2 of 4')).toBeTruthy();
  });

  it('pluralises single lift correctly', () => {
    const { getByText } = wrap(
      <CycleScreen
        {...baseProps}
        lifts={[{ id: 'bench', label: 'Bench', trainingMax: 215 }]}
        completedSessions={[]}
      />,
    );
    expect(getByText('4 weeks · 1 lift')).toBeTruthy();
  });
});
