import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { LiftPageTitle } from '../LiftPageTitle';

const renderTitle = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('LiftPageTitle', () => {
  it('renders the lift display name as the headline', () => {
    const screen = renderTitle(<LiftPageTitle lift="squat" />);
    expect(screen.getByText(/Squat/)).toBeTruthy();
  });

  it('renders each lift label correctly', () => {
    expect(renderTitle(<LiftPageTitle lift="bench" />).getByText(/Bench/)).toBeTruthy();
    expect(renderTitle(<LiftPageTitle lift="deadlift" />).getByText(/Deadlift/)).toBeTruthy();
    expect(renderTitle(<LiftPageTitle lift="press" />).getByText(/Press/)).toBeTruthy();
  });

  it('shows the chevron affordance only when the title is tappable (onPress provided)', () => {
    const tappable = renderTitle(<LiftPageTitle lift="squat" onPress={() => {}} />);
    expect(tappable.getByText('›')).toBeTruthy();

    const plain = renderTitle(<LiftPageTitle lift="squat" />);
    // No misleading affordance on a non-interactive title.
    expect(plain.queryByText('›')).toBeNull();
  });

  it('keeps the title a single accessible node — no separate chevron control', () => {
    const screen = renderTitle(<LiftPageTitle lift="squat" onPress={() => {}} />);
    // The whole title is one button announcing the destination; the chevron
    // does NOT get its own role/announcement.
    const title = screen.getByTestId('lift-page-title-squat');
    expect(title.props.accessibilityRole).toBe('button');
    expect(title.props.accessibilityLabel).toBe('Open Squat progress');
  });
});
