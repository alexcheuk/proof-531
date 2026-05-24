import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import { HistorySkeleton } from '../HistorySkeleton';

describe('HistorySkeleton', () => {
  it('renders the history-skeleton container', () => {
    const screen = render(
      <ThemeProvider>
        <HistorySkeleton />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('history-skeleton')).toBeTruthy();
  });
});
