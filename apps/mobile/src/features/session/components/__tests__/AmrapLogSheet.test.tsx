/**
 * Behavior tests for the AmrapLogSheet (W2.3 additions).
 *
 * Asserts:
 *   - Preset chips row renders 6 entries at default width.
 *   - Tapping a chip sets the stepper to the chip value.
 *   - Stepper ± after chip-select clears the chip-selected state.
 *   - PR row renders when reps cross above the existing-best e1RM and hides
 *     when they drop back below.
 *   - The inline " · PR" suffix is no longer rendered on the EST. 1RM caption
 *     (PR signaling promoted to its own row).
 */
import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

type MockBottomSheetProps = { index?: number; children?: React.ReactNode };
type MockViewProps = { children?: React.ReactNode; testID?: string };

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ index, children }: MockBottomSheetProps) => {
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

import { AmrapLogSheet } from '../AmrapLogSheet';

const renderWithTheme = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('AmrapLogSheet (W2.3)', () => {
  const baseProps = {
    open: true,
    lift: 'squat' as const,
    prescribedWeight: 195,
    prescribedReps: 5,
    unit: 'lbs' as const,
    existingBestE1RM: 250,
    onCancel: jest.fn(),
    onSave: jest.fn(),
  };

  it('renders the preset chips row (6 entries on standard width)', () => {
    const screen = renderWithTheme(<AmrapLogSheet {...baseProps} />);
    expect(screen.getByTestId('amrap-preset-chips')).toBeTruthy();
    expect(screen.getByTestId('amrap-chip-3')).toBeTruthy();
    expect(screen.getByTestId('amrap-chip-5')).toBeTruthy();
    expect(screen.getByTestId('amrap-chip-8')).toBeTruthy();
    expect(screen.getByTestId('amrap-chip-10')).toBeTruthy();
    expect(screen.getByTestId('amrap-chip-12')).toBeTruthy();
    expect(screen.getByTestId('amrap-chip-15')).toBeTruthy();
  });

  it('tapping a chip syncs the stepper value', () => {
    const onSave = jest.fn();
    const screen = renderWithTheme(<AmrapLogSheet {...baseProps} onSave={onSave} />);

    fireEvent.press(screen.getByTestId('amrap-chip-10'));
    fireEvent.press(screen.getByTestId('amrap-save'));

    expect(onSave).toHaveBeenCalledWith(10);
  });

  it('stepper ± after chip-select clears the chip selection (chip de-styles)', () => {
    const screen = renderWithTheme(<AmrapLogSheet {...baseProps} />);
    fireEvent.press(screen.getByTestId('amrap-chip-10'));

    // After chip select, the chip is in selected state — accessibilityState.selected = true.
    const chip = screen.getByTestId('amrap-chip-10');
    expect(chip.props.accessibilityState).toEqual({ selected: true });

    // Decrement the stepper — chip selection clears.
    fireEvent.press(screen.getByTestId('amrap-reps-stepper-minus'));
    const chipAfter = screen.getByTestId('amrap-chip-10');
    expect(chipAfter.props.accessibilityState).toEqual({ selected: false });
  });

  it('shows the PR row when reps × weight crosses the existingBest e1RM', () => {
    // existingBest = 250. prescribedReps=5 → reps default = 5. Epley e1RM at
    // weight=195, reps=5 = 195 × (1 + 5/30) = 195 × 1.1667 ≈ 227.5 — below 250.
    // Bump to reps=10 → 195 × (1 + 10/30) = 260 — crosses PR.
    const screen = renderWithTheme(<AmrapLogSheet {...baseProps} />);
    expect(screen.queryByTestId('amrap-pr-row')).toBeNull();

    fireEvent.press(screen.getByTestId('amrap-chip-10'));
    expect(screen.getByTestId('amrap-pr-row')).toBeTruthy();
  });

  it('PR row hides again when reps drop back below the threshold', () => {
    const screen = renderWithTheme(<AmrapLogSheet {...baseProps} />);
    fireEvent.press(screen.getByTestId('amrap-chip-10'));
    expect(screen.getByTestId('amrap-pr-row')).toBeTruthy();

    fireEvent.press(screen.getByTestId('amrap-chip-3'));
    expect(screen.queryByTestId('amrap-pr-row')).toBeNull();
  });

  it('does not render the inline " · PR" suffix on the EST. 1RM caption anymore', () => {
    // PR signaling is fully promoted to the dedicated row. The caption should
    // never carry the " · PR" suffix, even when isPotentialPR.
    const screen = renderWithTheme(<AmrapLogSheet {...baseProps} />);
    fireEvent.press(screen.getByTestId('amrap-chip-15'));
    const caption = screen.getByTestId('amrap-e1rm');
    // Children: ['EST. 1RM ', 304, ' ', 'lb'] — no trailing ' · PR'.
    const flat = (caption.props.children as unknown[]).join('');
    expect(flat.includes('PR')).toBe(false);
  });

  // ── Wave 3 W3-C: PR row height tween ──────────────────────────────────

  it('W3-C: PR row outer wrapper is always present in the tree (so the Reanimated height tween has a stable target)', () => {
    const screen = renderWithTheme(<AmrapLogSheet {...baseProps} />);
    // Hidden initial state (reps default = 5, below PR threshold for 250 e1RM).
    expect(screen.getByTestId('amrap-pr-row-wrapper-hidden')).toBeTruthy();
    expect(screen.queryByTestId('amrap-pr-row')).toBeNull();
  });

  it('W3-C: PR row wrapper switches testID once `showPRRow` is true (cross-into-PR)', () => {
    const screen = renderWithTheme(<AmrapLogSheet {...baseProps} />);
    fireEvent.press(screen.getByTestId('amrap-chip-10'));
    // Wrapper testID switches to the "visible" variant; the inner PR row
    // node also resolves.
    expect(screen.getByTestId('amrap-pr-row-wrapper')).toBeTruthy();
    expect(screen.getByTestId('amrap-pr-row')).toBeTruthy();
  });
});
