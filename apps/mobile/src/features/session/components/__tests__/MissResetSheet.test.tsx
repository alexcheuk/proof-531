import { ThemeProvider } from '@/design/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';

const mockApplyMissReset = jest.fn();
jest.mock('@/data/accessors/liftMissState', () => ({
  applyMissReset: (...args: unknown[]) => mockApplyMissReset(...args),
}));
jest.mock('@/data/DbProvider', () => ({
  useDb: () => ({ __stub: 'db' }),
}));

jest.mock('@gorhom/bottom-sheet', () => {
  const React = jest.requireActual('react');
  return {
    __esModule: true,
    // biome-ignore lint/suspicious/noExplicitAny: test stub
    default: ({ children }: any) => React.createElement(React.Fragment, null, children),
    BottomSheetBackdrop: () => null,
    // biome-ignore lint/suspicious/noExplicitAny: test stub
    BottomSheetView: ({ children }: any) => React.createElement(React.Fragment, null, children),
  };
});

const mockNotificationAsync = jest.fn();
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  notificationAsync: (...args: unknown[]) => mockNotificationAsync(...args),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

import { MissResetSheet } from '../MissResetSheet';

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

describe('MissResetSheet', () => {
  beforeEach(() => {
    mockApplyMissReset.mockReset();
    mockApplyMissReset.mockResolvedValue({ newTm: 250, unit: 'lbs' });
    mockNotificationAsync.mockClear();
  });

  it('shows Current and New TM with the 10% reset target', () => {
    const screen = wrap(
      <MissResetSheet open lift="squat" tmDisplay={275} unit="lbs" onClose={() => {}} />,
    );
    expect(screen.getByTestId('miss-reset-current')).toBeTruthy();
    expect(screen.getByTestId('miss-reset-new')).toBeTruthy();
    expect(screen.getByText('Reset TM')).toBeTruthy();
    // round(275 * 0.9, lbs) = 250
    expect(screen.getByText('250 lb')).toBeTruthy();
  });

  it('applies the reset and closes on success', async () => {
    const onClose = jest.fn();
    const screen = wrap(
      <MissResetSheet open lift="squat" tmDisplay={275} unit="lbs" onClose={onClose} />,
    );
    fireEvent.press(screen.getByTestId('miss-reset-confirm'));
    await waitFor(() => expect(mockApplyMissReset).toHaveBeenCalledTimes(1));
    expect(mockApplyMissReset).toHaveBeenCalledWith({ __stub: 'db' }, 'squat');
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(mockNotificationAsync).toHaveBeenCalledWith('success');
  });

  it('keeps the sheet open and surfaces an error on a failed apply', async () => {
    mockApplyMissReset.mockRejectedValue(new Error('boom'));
    const onClose = jest.fn();
    const screen = wrap(
      <MissResetSheet open lift="squat" tmDisplay={275} unit="lbs" onClose={onClose} />,
    );
    fireEvent.press(screen.getByTestId('miss-reset-confirm'));
    await waitFor(() => expect(screen.getByText('Could not apply · try again')).toBeTruthy());
    expect(onClose).not.toHaveBeenCalled();
  });

  it('cancel closes without applying', () => {
    const onClose = jest.fn();
    const screen = wrap(
      <MissResetSheet open lift="squat" tmDisplay={275} unit="lbs" onClose={onClose} />,
    );
    fireEvent.press(screen.getByTestId('miss-reset-cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockApplyMissReset).not.toHaveBeenCalled();
  });
});
