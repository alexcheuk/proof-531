import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { LiftStats } from '../LiftStats';

const renderStats = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('LiftStats', () => {
  it('renders TM, BEST e1RM, and CYCLE labels + values', () => {
    const screen = renderStats(<LiftStats tmValue={315} tmUnit="lbs" bestE1RM={342} cycle={2} />);
    expect(screen.getByTestId('lift-stats')).toBeTruthy();
    expect(screen.getByText('TM')).toBeTruthy();
    expect(screen.getByText('315 lb')).toBeTruthy();
    expect(screen.getByText('BEST e1RM')).toBeTruthy();
    expect(screen.getByText('342 lb')).toBeTruthy();
    expect(screen.getByText('CYCLE')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('rolling')).toBeTruthy();
  });

  it('renders an em-dash when no best e1RM has been recorded', () => {
    const screen = renderStats(<LiftStats tmValue={140} tmUnit="kg" bestE1RM={null} cycle={1} />);
    expect(screen.getByText(' - ')).toBeTruthy();
    expect(screen.getByText('140 kg')).toBeTruthy();
  });

  it('renders the pre-converted bestE1RM value with unit suffix', () => {
    const screen = renderStats(<LiftStats tmValue={225} tmUnit="lbs" bestE1RM={295} cycle={3} />);
    expect(screen.getByText('295 lb')).toBeTruthy();
  });
});
