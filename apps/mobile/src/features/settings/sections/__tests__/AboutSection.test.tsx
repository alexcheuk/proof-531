import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import { AboutSection } from '../AboutSection';

describe('AboutSection', () => {
  it('renders the Program + App version rows with labels and values', () => {
    const screen = render(
      <ThemeProvider>
        <AboutSection />
      </ThemeProvider>,
    );
    expect(screen.getByText('About')).toBeTruthy();
    expect(screen.getByText('Program')).toBeTruthy();
    expect(screen.getByText('Jim Wendler · 5/3/1 for beginners')).toBeTruthy();
    expect(screen.getByText('v3.0')).toBeTruthy();
    expect(screen.getByText('App version')).toBeTruthy();
    expect(screen.getByText('531. ledger · paper-and-ink discipline')).toBeTruthy();
    expect(screen.getByText('0.1.0')).toBeTruthy();
    expect(screen.getByText('alpha')).toBeTruthy();
  });
});
