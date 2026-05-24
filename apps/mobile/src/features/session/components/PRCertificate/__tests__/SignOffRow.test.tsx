import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SignOffRow } from '../SignOffRow';

const renderRow = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('SignOffRow', () => {
  it('renders the "On the <lift>" line and the standard sign-off', () => {
    const screen = renderRow(<SignOffRow liftLabel="squat" />);
    expect(screen.getByText('On the squat')).toBeTruthy();
    expect(screen.getByText('filed · 531 · ledger')).toBeTruthy();
  });

  it('renders the lift label as supplied (lowercase, sentence form)', () => {
    const screen = renderRow(<SignOffRow liftLabel="bench" />);
    expect(screen.getByText('On the bench')).toBeTruthy();
  });
});
