import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import { SessionCompleteMasthead } from '../SessionCompleteMasthead';

describe('SessionCompleteMasthead', () => {
  it('renders the 531 . ledger wordmark + Filed chip', () => {
    const screen = render(
      <ThemeProvider>
        <SessionCompleteMasthead />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('session-complete-masthead')).toBeTruthy();
    expect(screen.getByText('531')).toBeTruthy();
    expect(screen.getByText('ledger')).toBeTruthy();
    expect(screen.getByText('Filed')).toBeTruthy();
  });
});
