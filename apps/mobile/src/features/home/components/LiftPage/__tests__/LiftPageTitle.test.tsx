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
});
