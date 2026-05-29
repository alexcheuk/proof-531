import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { TmTestReceiptBand } from '../TmTestReceiptBand';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('TmTestReceiptBand', () => {
  it('renders the TM test label and rep count', () => {
    const screen = wrap(
      <TmTestReceiptBand
        tmDisplay={225}
        reps={5}
        unitGlyph="lb"
        elapsedReady={false}
        elapsedValue=""
      />,
    );
    expect(screen.getByTestId('session-complete-tm-test-receipt')).toBeTruthy();
    expect(screen.getByText('TM test')).toBeTruthy();
    expect(screen.getByText('225 × 5')).toBeTruthy();
  });

  it('shows elapsed row when elapsedReady is true', () => {
    const screen = wrap(
      <TmTestReceiptBand
        tmDisplay={225}
        reps={5}
        unitGlyph="lb"
        elapsedReady
        elapsedValue="14:22"
      />,
    );
    expect(screen.getByTestId('receipt-tm-test-elapsed')).toBeTruthy();
    expect(screen.getByText('14:22')).toBeTruthy();
  });

  it('omits elapsed row when elapsedReady is false', () => {
    const screen = wrap(
      <TmTestReceiptBand
        tmDisplay={225}
        reps={5}
        unitGlyph="lb"
        elapsedReady={false}
        elapsedValue="14:22"
      />,
    );
    expect(screen.queryByTestId('receipt-tm-test-elapsed')).toBeNull();
  });

  it('renders 0 reps for a missed test', () => {
    const screen = wrap(
      <TmTestReceiptBand
        tmDisplay={275}
        reps={0}
        unitGlyph="lb"
        elapsedReady={false}
        elapsedValue=""
      />,
    );
    expect(screen.getByText('275 × 0')).toBeTruthy();
  });

  it('renders kg unit glyph correctly', () => {
    const screen = wrap(
      <TmTestReceiptBand
        tmDisplay={120}
        reps={6}
        unitGlyph="kg"
        elapsedReady={false}
        elapsedValue=""
      />,
    );
    expect(screen.getByText('120 × 6')).toBeTruthy();
  });
});
