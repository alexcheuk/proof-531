import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { StreakBadge } from '../StreakBadge';

const renderBadge = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('StreakBadge', () => {
  it('renders nothing when streak is below the 3-day threshold', () => {
    const a = renderBadge(<StreakBadge streak={0} />);
    expect(a.queryByTestId('home-streak-badge')).toBeNull();

    const b = renderBadge(<StreakBadge streak={2} />);
    expect(b.queryByTestId('home-streak-badge')).toBeNull();
  });

  it('renders the streak label when streak is exactly 3', () => {
    const screen = renderBadge(<StreakBadge streak={3} />);
    expect(screen.getByTestId('home-streak-badge')).toBeTruthy();
    expect(screen.getByText('★ 3-day streak')).toBeTruthy();
  });

  it('renders the "keep it going" tail', () => {
    const screen = renderBadge(<StreakBadge streak={12} />);
    expect(screen.getByText('★ 12-day streak')).toBeTruthy();
    expect(screen.getByText('· keep it going')).toBeTruthy();
  });
});
