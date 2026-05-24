import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

const mockToggle = jest.fn();
jest.mock('../../hooks/useToggleLift', () => ({
  useToggleLift: () => mockToggle,
}));

import { ActiveLiftsSection } from '../ActiveLiftsSection';

const renderSection = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ActiveLiftsSection', () => {
  beforeEach(() => mockToggle.mockClear());

  it('renders the Active lifts title + counter hint', () => {
    const screen = renderSection(
      <ActiveLiftsSection enabled={['squat', 'bench', 'deadlift', 'press']} storageUnit="lbs" />,
    );
    expect(screen.getByText('Active lifts')).toBeTruthy();
    expect(screen.getByText('4 of 4 · 16 sessions per cycle')).toBeTruthy();
  });

  it('renders a row per lift in canonical order with toggle testIDs', () => {
    const screen = renderSection(
      <ActiveLiftsSection enabled={['squat', 'bench']} storageUnit="lbs" />,
    );
    expect(screen.getByTestId('settings-lift-toggle-squat')).toBeTruthy();
    expect(screen.getByTestId('settings-lift-toggle-bench')).toBeTruthy();
    expect(screen.getByTestId('settings-lift-toggle-deadlift')).toBeTruthy();
    expect(screen.getByTestId('settings-lift-toggle-press')).toBeTruthy();
  });

  it('renders the lift-specific bump secondary copy in lb', () => {
    const screen = renderSection(<ActiveLiftsSection enabled={['squat']} storageUnit="lbs" />);
    // Squat + deadlift both render the "+10 lb / cycle · lower body" copy.
    expect(screen.queryAllByText('+10 lb / cycle · lower body').length).toBe(2);
    expect(screen.queryAllByText('+5 lb / cycle · upper body').length).toBe(2);
  });

  it('marks the single remaining enabled lift as disabled (cannot turn off the last lift)', () => {
    const screen = renderSection(<ActiveLiftsSection enabled={['squat']} storageUnit="lbs" />);
    const checkbox = screen.getByTestId('settings-lift-checkbox-squat');
    expect(checkbox.props.accessibilityState?.disabled).toBe(true);
  });

  it('renders the kg bump secondary copy when storage unit is kg', () => {
    const screen = renderSection(<ActiveLiftsSection enabled={['press']} storageUnit="kg" />);
    // Both upper-body lifts render "+2.5 kg / cycle · upper body" copy.
    expect(screen.queryAllByText('+2.5 kg / cycle · upper body').length).toBe(2);
    expect(screen.queryAllByText('+5 kg / cycle · lower body').length).toBe(2);
  });
});
