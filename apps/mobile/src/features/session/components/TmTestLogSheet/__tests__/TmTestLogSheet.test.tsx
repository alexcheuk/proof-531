import { ThemeProvider } from '@/design/theme';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { TmTestLogSheet } from '../TmTestLogSheet';

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
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('TmTestLogSheet', () => {
  it('renders the lift name and TM weight', () => {
    const screen = wrap(
      <TmTestLogSheet
        open
        lift="bench"
        tm={225}
        unit="lbs"
        onCancel={() => {}}
        onSave={() => {}}
        testID="tm-test-sheet"
      />,
    );
    expect(screen.getByText('Bench')).toBeTruthy();
    expect(screen.getByText('225 lb')).toBeTruthy();
  });

  it('seeds the stepper at 0', () => {
    const screen = wrap(
      <TmTestLogSheet
        open
        lift="squat"
        tm={275}
        unit="lbs"
        onCancel={() => {}}
        onSave={() => {}}
      />,
    );
    // The stepper value text starts at "0"
    expect(screen.getByText('0')).toBeTruthy();
  });

  it('shows RESET chip when reps = 0', () => {
    const screen = wrap(
      <TmTestLogSheet
        open
        lift="bench"
        tm={225}
        unit="lbs"
        onCancel={() => {}}
        onSave={() => {}}
      />,
    );
    expect(screen.getByTestId('tm-test-band-chip')).toBeTruthy();
    expect(screen.getByText('RESET')).toBeTruthy();
  });

  it('shows PASS chip when reps are incremented to 5', () => {
    const screen = wrap(
      <TmTestLogSheet
        open
        lift="bench"
        tm={225}
        unit="lbs"
        onCancel={() => {}}
        onSave={() => {}}
      />,
    );
    const incBtn = screen.getByTestId('tm-test-reps-stepper-plus');
    fireEvent.press(incBtn);
    fireEvent.press(incBtn);
    fireEvent.press(incBtn);
    fireEvent.press(incBtn);
    fireEvent.press(incBtn);
    expect(screen.getByText('PASS')).toBeTruthy();
  });

  it('shows HOLD chip when reps = 3', () => {
    const screen = wrap(
      <TmTestLogSheet
        open
        lift="deadlift"
        tm={315}
        unit="lbs"
        onCancel={() => {}}
        onSave={() => {}}
      />,
    );
    const incBtn = screen.getByTestId('tm-test-reps-stepper-plus');
    fireEvent.press(incBtn);
    fireEvent.press(incBtn);
    fireEvent.press(incBtn);
    expect(screen.getByText('HOLD')).toBeTruthy();
  });

  it('calls onSave with the current rep count', async () => {
    const onSave = jest.fn();
    const screen = wrap(
      <TmTestLogSheet open lift="press" tm={135} unit="lbs" onCancel={() => {}} onSave={onSave} />,
    );
    const incBtn = screen.getByTestId('tm-test-reps-stepper-plus');
    for (let i = 0; i < 6; i++) fireEvent.press(incBtn);

    fireEvent.press(screen.getByTestId('tm-test-save'));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(6));
  });

  it('calls onCancel when cancel is pressed', () => {
    const onCancel = jest.fn();
    const screen = wrap(
      <TmTestLogSheet
        open
        lift="bench"
        tm={225}
        unit="lbs"
        onCancel={onCancel}
        onSave={() => {}}
      />,
    );
    fireEvent.press(screen.getByTestId('tm-test-cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('resets reps to 0 when reopened', () => {
    const { rerender, getByTestId, getByText } = render(
      <ThemeProvider>
        <TmTestLogSheet
          open={false}
          lift="squat"
          tm={275}
          unit="lbs"
          onCancel={() => {}}
          onSave={() => {}}
        />
      </ThemeProvider>,
    );

    // Open the sheet and increment to 3
    rerender(
      <ThemeProvider>
        <TmTestLogSheet
          open
          lift="squat"
          tm={275}
          unit="lbs"
          onCancel={() => {}}
          onSave={() => {}}
        />
      </ThemeProvider>,
    );
    const incBtn = getByTestId('tm-test-reps-stepper-plus');
    fireEvent.press(incBtn);
    fireEvent.press(incBtn);
    fireEvent.press(incBtn);
    expect(getByText('3')).toBeTruthy();

    // Close and reopen — reps should reset to 0
    rerender(
      <ThemeProvider>
        <TmTestLogSheet
          open={false}
          lift="squat"
          tm={275}
          unit="lbs"
          onCancel={() => {}}
          onSave={() => {}}
        />
      </ThemeProvider>,
    );
    rerender(
      <ThemeProvider>
        <TmTestLogSheet
          open
          lift="squat"
          tm={275}
          unit="lbs"
          onCancel={() => {}}
          onSave={() => {}}
        />
      </ThemeProvider>,
    );
    expect(getByText('0')).toBeTruthy();
  });
});
