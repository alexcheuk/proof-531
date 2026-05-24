import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import { HomeSkeleton } from '../HomeSkeleton';

describe('HomeSkeleton', () => {
  it('renders the home-skeleton container', () => {
    const screen = render(
      <ThemeProvider>
        <HomeSkeleton />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('home-skeleton')).toBeTruthy();
  });
});
