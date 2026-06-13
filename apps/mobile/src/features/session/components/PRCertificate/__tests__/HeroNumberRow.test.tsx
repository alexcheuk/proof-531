import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { HeroNumberRow } from '../HeroNumberRow';

const renderHero = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('HeroNumberRow', () => {
  it('renders the e1RM hero number, unit glyph, and est. 1rm caption', () => {
    const screen = renderHero(<HeroNumberRow e1RM={315} unit="lb" testID="hero" />);
    expect(screen.getByTestId('hero')).toBeTruthy();
    expect(screen.getByText('315')).toBeTruthy();
    expect(screen.getByText('lb')).toBeTruthy();
    expect(screen.getByText('est. 1rm')).toBeTruthy();
  });

  it('renders the kg unit when storage is metric', () => {
    // Callers pre-round to int before passing in (see PRCertificate.tsx
    // prop doc  -  "rounded int"). formatWeight applies that contract.
    const screen = renderHero(<HeroNumberRow e1RM={143} unit="kg" />);
    expect(screen.getByText('143')).toBeTruthy();
    expect(screen.getByText('kg')).toBeTruthy();
  });

  it('renders thousands-separators for 4-digit weights', () => {
    const screen = renderHero(<HeroNumberRow e1RM={1234} unit="lb" />);
    expect(screen.getByText('1,234')).toBeTruthy();
  });
});
