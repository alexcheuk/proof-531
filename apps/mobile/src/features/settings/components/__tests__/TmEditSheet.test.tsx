import { ThemeProvider } from '@/design/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react-native';
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

import { TmEditSheet } from '../TmEditSheet';

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

describe('TmEditSheet', () => {
  beforeEach(() => mockSetTrainingMax.mockClear());

  it('renders the Edit training max eyebrow + lift label', () => {
    const screen = wrap(
      <TmEditSheet
        lift="squat"
        currentValue={315}
        storageUnit="lbs"
        displayUnit="lbs"
        onClose={() => {}}
      />,
    );
    expect(screen.getByText('Edit training max')).toBeTruthy();
    expect(screen.getByText('Back squat')).toBeTruthy();
    expect(screen.getByTestId('tm-edit-stepper')).toBeTruthy();
  });

  it('renders "No change from current" when draft equals currentValue', () => {
    const screen = wrap(
      <TmEditSheet
        lift="bench"
        currentValue={225}
        storageUnit="lbs"
        displayUnit="lbs"
        onClose={() => {}}
      />,
    );
    expect(screen.getByTestId('tm-edit-delta').props.children).toBe('No change from current');
  });

  it('hides the storage ≠ display caption when both units match', () => {
    const screen = wrap(
      <TmEditSheet
        lift="press"
        currentValue={135}
        storageUnit="lbs"
        displayUnit="lbs"
        onClose={() => {}}
      />,
    );
    expect(screen.queryByText(/editing in/)).toBeNull();
  });

  it('renders the storage ≠ display caption when units diverge', () => {
    const screen = wrap(
      <TmEditSheet
        lift="press"
        currentValue={135}
        storageUnit="lbs"
        displayUnit="kg"
        onClose={() => {}}
      />,
    );
    expect(screen.getByText('editing in lb · displayed as kg')).toBeTruthy();
  });

  it('fires onClose when Cancel is pressed', () => {
    const onClose = jest.fn();
    const screen = wrap(
      <TmEditSheet
        lift="squat"
        currentValue={315}
        storageUnit="lbs"
        displayUnit="lbs"
        onClose={onClose}
      />,
    );
    fireEvent.press(screen.getByTestId('tm-edit-cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
