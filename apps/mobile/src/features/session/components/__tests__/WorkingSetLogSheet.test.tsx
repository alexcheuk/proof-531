/**
 * Behavioral test for WorkingSetLogSheet (W1.3).
 *
 * Asserts copy, the stepper bounds (prescribedReps + 5 max), Save passing
 * the current stepper value through to `onSave`, and that re-opening the
 * sheet with a different prescription re-syncs the stepper.
 */
import { ThemeProvider } from '@/design/theme';
import { act, fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

const mockBottomSheet = {
  index: -1 as number,
};

type MockBottomSheetProps = { index?: number; children?: React.ReactNode };
type MockViewProps = { children?: React.ReactNode; testID?: string };

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ index, children }: MockBottomSheetProps) => {
      mockBottomSheet.index = index ?? -1;
      if ((index ?? -1) < 0) return null;
      return React.createElement(React.Fragment, null, children);
    },
    BottomSheetBackdrop: () => null,
    BottomSheetView: ({ children }: MockViewProps) => {
      const React = require('react');
      return React.createElement(React.Fragment, null, children);
    },
  };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

import { WorkingSetLogSheet } from '../WorkingSetLogSheet';

const renderWithTheme = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('WorkingSetLogSheet', () => {
  it('renders the LOG ACTUAL header with lift, prescribed weight, and reps', () => {
    const screen = renderWithTheme(
      <WorkingSetLogSheet
        open
        lift="squat"
        prescribedWeight={195}
        prescribedReps={5}
        unit="lbs"
        onCancel={() => {}}
        onSave={() => {}}
      />,
    );
    expect(screen.getByText('LOG ACTUAL')).toBeTruthy();
    expect(screen.getByText('Squat')).toBeTruthy();
    expect(screen.getByText('195 lb · PRESCRIBED 5')).toBeTruthy();
    expect(screen.getByTestId('working-set-log-reps-stepper')).toBeTruthy();
  });

  it('pre-fills the stepper to prescribedReps', () => {
    const screen = renderWithTheme(
      <WorkingSetLogSheet
        open
        lift="bench"
        prescribedWeight={155}
        prescribedReps={5}
        unit="lbs"
        onCancel={() => {}}
        onSave={() => {}}
      />,
    );
    // The stepper renders the value verbatim; assert "5" appears as a text.
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('calls onSave with the current stepper value', () => {
    const onSave = jest.fn();
    const screen = renderWithTheme(
      <WorkingSetLogSheet
        open
        lift="squat"
        prescribedWeight={195}
        prescribedReps={5}
        unit="lbs"
        onCancel={() => {}}
        onSave={onSave}
      />,
    );
    fireEvent.press(screen.getByTestId('working-set-log-save'));
    expect(onSave).toHaveBeenCalledWith(5);
  });

  it('decrements the stepper and saves the lower value', () => {
    const onSave = jest.fn();
    const screen = renderWithTheme(
      <WorkingSetLogSheet
        open
        lift="squat"
        prescribedWeight={195}
        prescribedReps={5}
        unit="lbs"
        onCancel={() => {}}
        onSave={onSave}
      />,
    );
    fireEvent.press(screen.getByTestId('working-set-log-reps-stepper-minus'));
    fireEvent.press(screen.getByTestId('working-set-log-reps-stepper-minus'));
    fireEvent.press(screen.getByTestId('working-set-log-save'));
    expect(onSave).toHaveBeenCalledWith(3);
  });

  it('caps the stepper at prescribedReps + 5', () => {
    const onSave = jest.fn();
    const screen = renderWithTheme(
      <WorkingSetLogSheet
        open
        lift="squat"
        prescribedWeight={195}
        prescribedReps={5}
        unit="lbs"
        onCancel={() => {}}
        onSave={onSave}
      />,
    );
    for (let i = 0; i < 10; i++) {
      fireEvent.press(screen.getByTestId('working-set-log-reps-stepper-plus'));
    }
    fireEvent.press(screen.getByTestId('working-set-log-save'));
    expect(onSave).toHaveBeenCalledWith(10); // 5 + 5 cap
  });

  it('calls onCancel when Cancel is pressed', () => {
    const onCancel = jest.fn();
    const screen = renderWithTheme(
      <WorkingSetLogSheet
        open
        lift="squat"
        prescribedWeight={195}
        prescribedReps={5}
        unit="lbs"
        onCancel={onCancel}
        onSave={() => {}}
      />,
    );
    fireEvent.press(screen.getByTestId('working-set-log-cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('re-syncs the stepper to prescribedReps when re-opened with a new prescription', () => {
    const onSave = jest.fn();
    const { rerender, getByTestId, getByText } = renderWithTheme(
      <WorkingSetLogSheet
        open
        lift="squat"
        prescribedWeight={195}
        prescribedReps={5}
        unit="lbs"
        onCancel={() => {}}
        onSave={onSave}
      />,
    );
    // Decrement once → reps=4.
    fireEvent.press(getByTestId('working-set-log-reps-stepper-minus'));
    expect(getByText('4')).toBeTruthy();
    // Close, then reopen with a different prescription.
    act(() => {
      rerender(
        <ThemeProvider>
          <WorkingSetLogSheet
            open={false}
            lift="squat"
            prescribedWeight={225}
            prescribedReps={3}
            unit="lbs"
            onCancel={() => {}}
            onSave={onSave}
          />
        </ThemeProvider>,
      );
    });
    act(() => {
      rerender(
        <ThemeProvider>
          <WorkingSetLogSheet
            open
            lift="squat"
            prescribedWeight={225}
            prescribedReps={3}
            unit="lbs"
            onCancel={() => {}}
            onSave={onSave}
          />
        </ThemeProvider>,
      );
    });
    expect(getByText('3')).toBeTruthy();
  });
});
