import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import {
  PR_CELEBRATION_HERO_TEXT,
  PrCelebrationHero,
  prCelebrationTypeLength,
} from '../PrCelebrationHero';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('PrCelebrationHero', () => {
  it('renders the default eyebrow and hero text fully when typedChars is omitted', () => {
    const screen = wrap(<PrCelebrationHero />);
    expect(screen.getByText('YOU HIT A NEW PR')).toBeTruthy();
    // The outer RNText renders "Stronger" + an inline amber "." child.
    // getByText sees the combined text "Stronger." from the containing node.
    expect(screen.queryAllByText(/Stronger/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders a custom eyebrow', () => {
    const screen = wrap(<PrCelebrationHero eyebrow="BENCH PRESS PR" />);
    expect(screen.getByText('BENCH PRESS PR')).toBeTruthy();
  });

  it('shows only the eyebrow when typedChars covers only the eyebrow portion', () => {
    const eyebrow = 'YOU HIT A NEW PR';
    const screen = wrap(<PrCelebrationHero eyebrow={eyebrow} typedChars={eyebrow.length} />);
    expect(screen.getByText(eyebrow)).toBeTruthy();
  });

  it('shows a space placeholder for empty eyebrow to preserve line height', () => {
    const screen = wrap(<PrCelebrationHero eyebrow="" typedChars={0} />);
    // Both eyebrow and hero are space-placeholders when nothing is typed.
    expect(screen.queryAllByText(' ').length).toBeGreaterThanOrEqual(1);
  });

  it('shows a space for hero text when typedChars is 0', () => {
    const screen = wrap(<PrCelebrationHero typedChars={0} />);
    // Default eyebrow hasn't started typing so hero body shows a space placeholder.
    expect(screen.queryAllByText(' ').length).toBeGreaterThanOrEqual(1);
  });

  it('prCelebrationTypeLength returns eyebrow.length + hero text length', () => {
    const eyebrow = 'YOU HIT A NEW PR';
    expect(prCelebrationTypeLength(eyebrow)).toBe(eyebrow.length + PR_CELEBRATION_HERO_TEXT.length);
  });
});
