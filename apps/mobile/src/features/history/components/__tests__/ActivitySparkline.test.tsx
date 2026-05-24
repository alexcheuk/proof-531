import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { ActivitySparkline } from '../ActivitySparkline';

const renderStrip = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ActivitySparkline', () => {
  it('renders the "last N days" caption with the array length', () => {
    const activity = Array.from({ length: 14 }, () => false);
    const screen = renderStrip(<ActivitySparkline activity={activity} />);
    expect(screen.getByText('last 14 days')).toBeTruthy();
  });

  it('renders one tick per activity bit (filled vs empty)', () => {
    const activity = [false, true, false, true, true];
    const screen = renderStrip(<ActivitySparkline activity={activity} />);
    expect(screen.getByTestId('activity-tick-0-empty')).toBeTruthy();
    expect(screen.getByTestId('activity-tick-1-filled')).toBeTruthy();
    expect(screen.getByTestId('activity-tick-2-empty')).toBeTruthy();
    expect(screen.getByTestId('activity-tick-3-filled')).toBeTruthy();
    expect(screen.getByTestId('activity-tick-4-filled')).toBeTruthy();
  });

  it('hides the streak chip when current streak is below 2', () => {
    const activity = [true, false, false, false, false]; // streak ends at 0
    const screen = renderStrip(<ActivitySparkline activity={activity} />);
    expect(screen.queryByTestId('history-activity-streak')).toBeNull();
  });

  it('renders the 🔥 streak chip when current streak ≥ 2', () => {
    // trailing 3 trues → streak 3
    const activity = [false, false, true, true, true];
    const screen = renderStrip(<ActivitySparkline activity={activity} />);
    expect(screen.getByTestId('history-activity-streak')).toBeTruthy();
    expect(screen.getByText('🔥 3-day streak')).toBeTruthy();
  });
});
