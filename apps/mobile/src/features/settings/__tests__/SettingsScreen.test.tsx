import { ThemeProvider } from '@/design/theme';
import { fireEvent, render, within } from '@testing-library/react-native';
import type React from 'react';
import { SettingsScreen, type SettingsScreenProps } from '../SettingsScreen';

const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const baseProps = (): SettingsScreenProps => ({
  unit: 'lbs',
  onUnitChange: jest.fn(),
  plateSet: 'standard-lbs',
  onPlateSetChange: jest.fn(),
  lifts: [
    { id: 'squat', label: 'Squat', enabled: true },
    { id: 'bench', label: 'Bench', enabled: false },
  ],
  onToggleLift: jest.fn(),
  analyticsEnabled: false,
  onAnalyticsChange: jest.fn(),
});

describe('SettingsScreen', () => {
  it('renders the four section headers', () => {
    const { getByTestId } = wrap(<SettingsScreen {...baseProps()} />);
    expect(getByTestId('settings-section-units')).toBeTruthy();
    expect(getByTestId('settings-section-plates')).toBeTruthy();
    expect(getByTestId('settings-section-lifts')).toBeTruthy();
    expect(getByTestId('settings-section-privacy')).toBeTruthy();
  });

  it('unit row toggles to kg via SegRail', () => {
    const props = baseProps();
    const { getByTestId } = wrap(<SettingsScreen {...props} />);
    const segRail = getByTestId('settings-unit');
    const kgButton = within(segRail).getByText('kg');
    fireEvent.press(kgButton);
    expect(props.onUnitChange).toHaveBeenCalledWith('kg');
  });

  it('pressing a lift toggle calls onToggleLift with id', () => {
    const props = baseProps();
    const { getByTestId } = wrap(<SettingsScreen {...props} />);
    const liftSwitch = getByTestId('settings-lift-toggle-squat');
    fireEvent(liftSwitch, 'valueChange', false);
    expect(props.onToggleLift).toHaveBeenCalledWith('squat');
  });

  it('pressing the analytics toggle calls onAnalyticsChange', () => {
    const props = baseProps();
    const { getByTestId } = wrap(<SettingsScreen {...props} />);
    const analyticsSwitch = getByTestId('analytics-toggle');
    fireEvent(analyticsSwitch, 'valueChange', true);
    expect(props.onAnalyticsChange).toHaveBeenCalledWith(true);
  });
});
