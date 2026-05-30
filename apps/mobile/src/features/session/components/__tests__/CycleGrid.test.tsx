import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { CycleGrid } from '../CycleGrid';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('CycleGrid', () => {
  it('renders the cycle number padded to two digits', () => {
    const screen = wrap(<CycleGrid cycle={3} completedThisCycle={4} sessionsInCycle={16} />);
    expect(screen.getByText(/Cycle № 03/)).toBeTruthy();
  });

  it('renders double-digit cycle numbers without truncation', () => {
    const screen = wrap(<CycleGrid cycle={12} completedThisCycle={8} sessionsInCycle={16} />);
    expect(screen.getByText(/Cycle № 12/)).toBeTruthy();
  });

  it('renders the position counter', () => {
    const screen = wrap(<CycleGrid cycle={1} completedThisCycle={6} sessionsInCycle={16} />);
    expect(screen.getByText('6 of 16')).toBeTruthy();
  });

  it('renders the day label row (D1–D4)', () => {
    const screen = wrap(<CycleGrid cycle={1} completedThisCycle={4} sessionsInCycle={16} />);
    expect(screen.getByText('D1')).toBeTruthy();
    expect(screen.getByText('D2')).toBeTruthy();
    expect(screen.getByText('D3')).toBeTruthy();
    expect(screen.getByText('D4')).toBeTruthy();
  });

  it('renders the correct number of grid cells', () => {
    const screen = wrap(<CycleGrid cycle={1} completedThisCycle={4} sessionsInCycle={12} />);
    expect(screen.getAllByTestId('cycle-cell').length).toBe(12);
  });
});
