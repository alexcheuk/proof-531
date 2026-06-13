/**
 * Behavioral tests for the AmrapLogSheet composition shell.
 *
 * Mocks useAmrapLogState so the tests focus on the visual composition:
 * lift label, prescribed weight, ProjectionChip wiring, NumberStepper
 * presence, AmrapFooter handlers, and the new "BIG SET." caption that
 * appears when reps are well above the prescribed minimum.
 */
import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

const mockState: {
  reps: number;
  pending: boolean;
  setReps: jest.Mock;
  handleSave: jest.Mock;
  handleCancel: jest.Mock;
} = {
  reps: 0,
  pending: false,
  setReps: jest.fn(),
  handleSave: jest.fn(),
  handleCancel: jest.fn(),
};

jest.mock('@/features/session/hooks/useAmrapLogState', () => ({
  useAmrapLogState: () => mockState,
}));

// @gorhom/bottom-sheet stub  -  the real lib needs the Reanimated worklets
// bridge. We just need the children to render.
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

import { AmrapLogSheet } from '../AmrapLogSheet';

const renderSheet = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const baseProps = {
  open: true,
  lift: 'squat' as const,
  prescribedWeight: 225,
  prescribedReps: 5,
  unit: 'lbs' as const,
  onCancel: jest.fn(),
  onSave: jest.fn(),
};

beforeEach(() => {
  mockState.reps = 0;
  mockState.pending = false;
  mockState.setReps.mockClear();
  mockState.handleSave.mockClear();
  mockState.handleCancel.mockClear();
});

describe('AmrapLogSheet', () => {
  it('renders the LOG AMRAP eyebrow, lift label, and prescribed weight badge', () => {
    const screen = renderSheet(<AmrapLogSheet {...baseProps} />);
    expect(screen.getByText('LOG AMRAP')).toBeTruthy();
    expect(screen.getByText('Squat')).toBeTruthy();
    expect(screen.getByText('225 lb')).toBeTruthy();
  });

  it('renders the question prompt + projection chip', () => {
    const screen = renderSheet(<AmrapLogSheet {...baseProps} />);
    expect(screen.getByText('How many reps?')).toBeTruthy();
    expect(screen.getByTestId('amrap-e1rm-caption')).toBeTruthy();
  });

  it('renders the rep stepper + footer wiring', () => {
    const screen = renderSheet(<AmrapLogSheet {...baseProps} />);
    expect(screen.getByTestId('amrap-reps-stepper')).toBeTruthy();
    expect(screen.getByTestId('amrap-cancel')).toBeTruthy();
    expect(screen.getByTestId('amrap-save')).toBeTruthy();
  });

  it('forwards footer presses to handleCancel + handleSave', () => {
    const screen = renderSheet(<AmrapLogSheet {...baseProps} />);
    fireEvent.press(screen.getByTestId('amrap-cancel'));
    expect(mockState.handleCancel).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByTestId('amrap-save'));
    expect(mockState.handleSave).toHaveBeenCalledTimes(1);
  });

  it('hides the BIG SET. caption when reps are at or below prescribed + 2', () => {
    mockState.reps = 7; // prescribed 5 + 2
    const screen = renderSheet(<AmrapLogSheet {...baseProps} />);
    expect(screen.queryByTestId('amrap-big-set')).toBeNull();
  });

  it('renders the BIG SET. caption once reps cross prescribed + 3', () => {
    mockState.reps = 8; // prescribed 5 + 3
    const screen = renderSheet(<AmrapLogSheet {...baseProps} />);
    expect(screen.getByTestId('amrap-big-set')).toBeTruthy();
    expect(screen.getByText('BIG SET.')).toBeTruthy();
  });

  it('flips the projection chip into PR state when existingBestE1RM is exceeded', () => {
    mockState.reps = 8;
    const screen = renderSheet(<AmrapLogSheet {...baseProps} existingBestE1RM={250} />);
    // 225 × (1 + 8/30) = 285  -  well over 250 → PR.
    expect(screen.getByTestId('amrap-pr-badge')).toBeTruthy();
  });

  it('surfaces a TIE caption + badge when reps would match (not beat) the existing best', () => {
    // Epley: 225 × (1 + 5/30) = 262.5 → plate-snaps to 265 (nearest 5lb step).
    // Set existingBestE1RM to 262.5 so round(predictedE1RM) === round(existingBest)  -  triggers isTiePR.
    mockState.reps = 5;
    const screen = renderSheet(<AmrapLogSheet {...baseProps} existingBestE1RM={262.5} />);
    expect(screen.getByTestId('amrap-tie-badge')).toBeTruthy();
    expect(screen.getByTestId('amrap-tie-caption')).toBeTruthy();
    expect(screen.getByText('TIES YOUR BEST · PUSH FOR +1')).toBeTruthy();
    expect(screen.queryByTestId('amrap-pr-badge')).toBeNull();
  });

  it('hides the TIE caption when projection beats the best (PR wins)', () => {
    mockState.reps = 6; // 225 × (1 + 6/30) = 270 > 262.5
    const screen = renderSheet(<AmrapLogSheet {...baseProps} existingBestE1RM={262.5} />);
    expect(screen.getByTestId('amrap-pr-badge')).toBeTruthy();
    expect(screen.queryByTestId('amrap-tie-caption')).toBeNull();
  });

  it('passes a testID through to the Sheet primitive without crashing', () => {
    // The Sheet primitive forwards testID to BottomSheet; our mock collapses
    // BottomSheet to a Fragment that drops props, so we can't assert the
    // root testID. Verify the contents still render so we know the prop
    // didn't blow up the render.
    const screen = renderSheet(<AmrapLogSheet {...baseProps} testID="amrap-sheet" />);
    expect(screen.getByText('LOG AMRAP')).toBeTruthy();
  });
});
