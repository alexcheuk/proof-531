import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { LiftPageEyebrow } from '../LiftPageEyebrow';

const renderEyebrow = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('LiftPageEyebrow', () => {
  it('renders the Cycle/Day caps label', () => {
    const screen = renderEyebrow(
      <LiftPageEyebrow lift="squat" cycle={3} week={2} isInProgress={false} />,
    );
    expect(screen.getByText('Cycle 3 · Day 2')).toBeTruthy();
  });

  it('omits the In progress chip when isInProgress is false', () => {
    const screen = renderEyebrow(
      <LiftPageEyebrow lift="bench" cycle={1} week={1} isInProgress={false} />,
    );
    expect(screen.queryByTestId('lift-page-bench-in-progress')).toBeNull();
    expect(screen.queryByText('In progress')).toBeNull();
  });

  it('renders the In progress chip with a testID when isInProgress is true', () => {
    const screen = renderEyebrow(
      <LiftPageEyebrow lift="deadlift" cycle={2} week={3} isInProgress={true} />,
    );
    expect(screen.getByTestId('lift-page-deadlift-in-progress')).toBeTruthy();
    expect(screen.getByText('In progress')).toBeTruthy();
  });
});
