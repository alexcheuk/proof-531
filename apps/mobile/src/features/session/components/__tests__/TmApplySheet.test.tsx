import { ThemeProvider } from '@/design/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';

const mockSetTrainingMax = jest.fn().mockResolvedValue(undefined);
jest.mock('@/data/accessors/trainingMax', () => ({
  setTrainingMax: (...args: unknown[]) => mockSetTrainingMax(...args),
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

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

import { TmApplySheet } from '../TmApplySheet';

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

describe('TmApplySheet', () => {
  beforeEach(() => mockSetTrainingMax.mockClear());

  it('shows current TM and new TM for increment suggestion', () => {
    const screen = wrap(
      <TmApplySheet
        open
        lift="squat"
        suggestion={{ kind: 'increment', delta: 10 }}
        tmDisplay={275}
        unit="lbs"
        storageUnit="lbs"
        onClose={() => {}}
      />,
    );
    expect(screen.getByTestId('tm-apply-current')).toBeTruthy();
    expect(screen.getByTestId('tm-apply-new')).toBeTruthy();
    expect(screen.getByText('Increase TM')).toBeTruthy();
    expect(screen.getByTestId('tm-apply-confirm')).toBeTruthy();
  });

  it('calls setTrainingMax with the new TM on apply (increment)', async () => {
    const onClose = jest.fn();
    const screen = wrap(
      <TmApplySheet
        open
        lift="squat"
        suggestion={{ kind: 'increment', delta: 10 }}
        tmDisplay={275}
        unit="lbs"
        storageUnit="lbs"
        onClose={onClose}
      />,
    );
    fireEvent.press(screen.getByTestId('tm-apply-confirm'));
    await waitFor(() => expect(mockSetTrainingMax).toHaveBeenCalledTimes(1));
    // 275 + 10 = 285, stored in lbs
    expect(mockSetTrainingMax).toHaveBeenCalledWith({ __stub: 'db' }, 'squat', 285, 'lbs');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows Reset TM title and applies 10% reset', async () => {
    const onClose = jest.fn();
    const screen = wrap(
      <TmApplySheet
        open
        lift="squat"
        suggestion={{ kind: 'reset', resetPct: 0.9 }}
        tmDisplay={275}
        unit="lbs"
        storageUnit="lbs"
        onClose={onClose}
      />,
    );
    expect(screen.getByText('Reset TM')).toBeTruthy();
    fireEvent.press(screen.getByTestId('tm-apply-confirm'));
    await waitFor(() => expect(mockSetTrainingMax).toHaveBeenCalledTimes(1));
    // round(275 * 0.9, lbs) = round(247.5, lbs) = 250
    expect(mockSetTrainingMax).toHaveBeenCalledWith({ __stub: 'db' }, 'squat', 250, 'lbs');
  });

  it('closes without DB write on hold suggestion', async () => {
    const onClose = jest.fn();
    const screen = wrap(
      <TmApplySheet
        open
        lift="squat"
        suggestion={{ kind: 'hold' }}
        tmDisplay={275}
        unit="lbs"
        storageUnit="lbs"
        onClose={onClose}
      />,
    );
    expect(screen.getByText('TM is Honest')).toBeTruthy();
    fireEvent.press(screen.getByTestId('tm-apply-confirm'));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(mockSetTrainingMax).not.toHaveBeenCalled();
  });

  it('cancel button closes without writing', () => {
    const onClose = jest.fn();
    const screen = wrap(
      <TmApplySheet
        open
        lift="squat"
        suggestion={{ kind: 'increment', delta: 10 }}
        tmDisplay={275}
        unit="lbs"
        storageUnit="lbs"
        onClose={onClose}
      />,
    );
    fireEvent.press(screen.getByTestId('tm-apply-cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockSetTrainingMax).not.toHaveBeenCalled();
  });
});
