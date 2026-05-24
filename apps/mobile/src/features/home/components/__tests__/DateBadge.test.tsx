import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import { DateBadge } from '../DateBadge';

describe('DateBadge', () => {
  it('renders the supplied label', () => {
    const screen = render(
      <ThemeProvider>
        <DateBadge label="MON · MAY 24" />
      </ThemeProvider>,
    );
    expect(screen.getByText('MON · MAY 24')).toBeTruthy();
  });
});
