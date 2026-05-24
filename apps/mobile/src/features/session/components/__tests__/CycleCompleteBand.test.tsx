import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { CycleCompleteBand } from '../CycleCompleteBand';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('CycleCompleteBand', () => {
  it('renders the zero-padded cycle number and the next-cycle hint', () => {
    const screen = wrap(<CycleCompleteBand cycle={2} />);
    expect(screen.getByTestId('session-complete-cycle-band')).toBeTruthy();
    expect(screen.getByText('★ Cycle 02 · COMPLETE')).toBeTruthy();
    expect(screen.getByText('Cycle 03 starts next')).toBeTruthy();
  });

  it('zero-pads single-digit cycles consistently in both labels', () => {
    const screen = wrap(<CycleCompleteBand cycle={9} />);
    expect(screen.getByText('★ Cycle 09 · COMPLETE')).toBeTruthy();
    expect(screen.getByText('Cycle 10 starts next')).toBeTruthy();
  });
});
