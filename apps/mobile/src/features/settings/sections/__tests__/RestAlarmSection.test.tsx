import { ThemeProvider } from '@/design/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { Platform } from 'react-native';

const mockUpdateSettings = jest.fn().mockResolvedValue(undefined);
jest.mock('@/data/accessors/settings', () => ({
  updateSettings: (...args: unknown[]) => mockUpdateSettings(...args),
}));
jest.mock('@/data/DbProvider', () => ({
  useDb: () => ({ mock: 'db' }),
}));

const mockGetReliability = jest.fn();
const mockOpenExact = jest.fn();
const mockOpenBattery = jest.fn();
const mockOpenSound = jest.fn();
jest.mock('@/lib/restChronometer', () => ({
  getRestReliability: () => mockGetReliability(),
  openExactAlarmSettings: () => mockOpenExact(),
  openBatteryOptimizationSettings: () => mockOpenBattery(),
  openRestDoneSoundSettings: (...args: unknown[]) => mockOpenSound(...args),
}));

import { RestAlarmSection } from '../RestAlarmSection';

// The section is Android-only (channel sounds + exact-alarm rows don't exist on iOS).
(Platform as { OS: string }).OS = 'android';

function wrap(ui: ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ThemeProvider>{ui}</ThemeProvider>
    </QueryClientProvider>,
  );
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe('RestAlarmSection', () => {
  beforeEach(() => {
    mockUpdateSettings.mockClear();
    mockOpenExact.mockClear();
    mockOpenBattery.mockClear();
    mockOpenSound.mockClear();
    mockGetReliability.mockResolvedValue({ exactAlarmsEnabled: true, batteryOptimized: false });
  });

  it('renders the title and both sound options', async () => {
    const screen = wrap(<RestAlarmSection restAlarmSound="alarm" />);
    await flush();
    expect(screen.getByText('Rest alarm')).toBeTruthy();
    expect(screen.getByText('Alarm')).toBeTruthy();
    expect(screen.getByText('Chime')).toBeTruthy();
  });

  it('persists a sound change through updateSettings', async () => {
    const screen = wrap(<RestAlarmSection restAlarmSound="alarm" />);
    await flush();
    fireEvent.press(screen.getByText('Chime'));
    expect(mockUpdateSettings).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ restAlarmSound: 'chime' }),
    );
  });

  it('opens the OS sound picker for the active channel', async () => {
    const screen = wrap(<RestAlarmSection restAlarmSound="alarm" />);
    await flush();
    fireEvent.press(screen.getByTestId('settings-rest-alarm-pick-sound'));
    expect(mockOpenSound).toHaveBeenCalledWith('alarm');
  });

  it('hides reliability rows when exact alarms are on and battery optimization is off', async () => {
    const screen = wrap(<RestAlarmSection restAlarmSound="alarm" />);
    await flush();
    expect(screen.queryByTestId('settings-rest-alarm-exact')).toBeNull();
    expect(screen.queryByTestId('settings-rest-alarm-battery')).toBeNull();
  });

  it('surfaces both reliability rows when the OS will delay the alert', async () => {
    mockGetReliability.mockResolvedValue({ exactAlarmsEnabled: false, batteryOptimized: true });
    const screen = wrap(<RestAlarmSection restAlarmSound="alarm" />);
    await flush();
    fireEvent.press(screen.getByTestId('settings-rest-alarm-exact'));
    expect(mockOpenExact).toHaveBeenCalled();
    fireEvent.press(screen.getByTestId('settings-rest-alarm-battery'));
    expect(mockOpenBattery).toHaveBeenCalled();
  });
});
