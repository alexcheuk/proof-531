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
    const screen = renderHero(<HeroNumberRow e1RM={142.5} unit="kg" />);
    expect(screen.getByText('142.5')).toBeTruthy();
    expect(screen.getByText('kg')).toBeTruthy();
  });
});
