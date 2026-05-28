import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import { AboutSection } from '../AboutSection';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { version: '1.2.3' } },
}));

describe('AboutSection', () => {
  it('renders the Program + App version rows, pulling the version from expo-constants', () => {
    const screen = render(
      <ThemeProvider>
        <AboutSection />
      </ThemeProvider>,
    );
    expect(screen.getByText('About')).toBeTruthy();
    expect(screen.getByText('Program')).toBeTruthy();
    expect(screen.getByText('Jim Wendler · 5/3/1 + BBB')).toBeTruthy();
    expect(screen.getByText('v3.0')).toBeTruthy();
    expect(screen.getByText('App version')).toBeTruthy();
    expect(screen.getByText('531. ledger · paper-and-ink discipline')).toBeTruthy();
    expect(screen.getByText('1.2.3')).toBeTruthy();
  });
});
