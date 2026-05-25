import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '../theme';
import { SecondaryLink } from './SecondaryLink';

function renderWithTheme(node: React.ReactElement) {
  return render(<ThemeProvider>{node}</ThemeProvider>);
}

describe('SecondaryLink', () => {
  it('renders the label as uppercase mono text', () => {
    renderWithTheme(
      <SecondaryLink testID="link" onPress={() => {}}>
        skip · close the day
      </SecondaryLink>,
    );
    expect(screen.getByTestId('link')).toBeTruthy();
    expect(screen.getByText('skip · close the day')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const fn = jest.fn();
    renderWithTheme(
      <SecondaryLink testID="link" onPress={fn}>
        tap
      </SecondaryLink>,
    );
    fireEvent.press(screen.getByTestId('link'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('uses the passed accessibilityLabel', () => {
    renderWithTheme(
      <SecondaryLink testID="link" onPress={() => {}} accessibilityLabel="Skip BBB">
        SKIP
      </SecondaryLink>,
    );
    expect(screen.getByLabelText('Skip BBB')).toBeTruthy();
  });
});
