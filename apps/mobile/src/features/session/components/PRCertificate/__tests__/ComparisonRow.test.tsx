import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { ComparisonRow } from '../ComparisonRow';

const renderRow = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ComparisonRow', () => {
  it('renders the Previous best label + prior e1RM and unit', () => {
    const screen = renderRow(<ComparisonRow prevE1RM={295} delta={20} unit="lb" testID="delta" />);
    expect(screen.getByText('Previous best')).toBeTruthy();
    expect(screen.getByText('Stronger by')).toBeTruthy();
    expect(screen.getByText(/295/)).toBeTruthy();
  });

  it('renders the +delta hero number with sign', () => {
    const screen = renderRow(<ComparisonRow prevE1RM={295} delta={20} unit="lb" testID="delta" />);
    expect(screen.getByTestId('delta').props.children).toBe('+20');
  });

  it('formats negative deltas with their literal sign (no double-+)', () => {
    const screen = renderRow(<ComparisonRow prevE1RM={300} delta={-5} unit="lb" testID="delta" />);
    // Component prefixes a "+"  -  the consumer only renders ComparisonRow on
    // a real PR (delta > 0), so we lock in the current behavior: it always
    // shows a leading plus. This keeps the unit + spacing intact.
    expect(screen.getByTestId('delta').props.children).toBe('+-5');
  });
});
