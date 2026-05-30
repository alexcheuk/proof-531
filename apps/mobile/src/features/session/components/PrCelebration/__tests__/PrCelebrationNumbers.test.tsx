import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { PR_CELEBRATION_FINAL_EYEBROW, PrCelebrationNumbers } from '../PrCelebrationNumbers';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('PrCelebrationNumbers', () => {
  it('renders the default eyebrow and e1RM', () => {
    const screen = wrap(<PrCelebrationNumbers e1RMDisplay={245} unitGlyph="lb" />);
    expect(screen.getByTestId('pr-celebration-eyebrow')).toBeTruthy();
    expect(screen.getByText(PR_CELEBRATION_FINAL_EYEBROW)).toBeTruthy();
    expect(screen.getByTestId('pr-celebration-e1rm')).toBeTruthy();
    expect(screen.getByText('245')).toBeTruthy();
    expect(screen.getByText('lb')).toBeTruthy();
  });

  it('uses eyebrowOverride when provided', () => {
    const screen = wrap(
      <PrCelebrationNumbers e1RMDisplay={100} unitGlyph="kg" eyebrowOverride="PREVIOUS BEST" />,
    );
    expect(screen.getByText('PREVIOUS BEST')).toBeTruthy();
  });

  it('uses valueOverride when provided', () => {
    const screen = wrap(
      <PrCelebrationNumbers e1RMDisplay={200} unitGlyph="lb" valueOverride="185" />,
    );
    expect(screen.getByText('185')).toBeTruthy();
  });

  it('renders a single space for an empty eyebrowOverride to preserve line height', () => {
    const screen = wrap(
      <PrCelebrationNumbers e1RMDisplay={150} unitGlyph="lb" eyebrowOverride="" />,
    );
    expect(screen.getByTestId('pr-celebration-eyebrow').props.children).toBe(' ');
  });
});
