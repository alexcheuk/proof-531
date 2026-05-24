import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

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

import { ResetConfirmSheet } from '../ResetConfirmSheet';

const renderSheet = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ResetConfirmSheet', () => {
  it('renders the CONFIRM eyebrow + Reset everything? headline + body copy', () => {
    const screen = renderSheet(<ResetConfirmSheet open onCancel={() => {}} onConfirm={() => {}} />);
    expect(screen.getByText('CONFIRM')).toBeTruthy();
    expect(screen.getByText('Reset everything?')).toBeTruthy();
    expect(screen.getByText(/This deletes all your training maxes/)).toBeTruthy();
  });

  it('fires onConfirm when the destructive primary is pressed', () => {
    const onConfirm = jest.fn();
    const screen = renderSheet(
      <ResetConfirmSheet open onCancel={() => {}} onConfirm={onConfirm} />,
    );
    fireEvent.press(screen.getByTestId('reset-confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('fires onCancel when the Keep my data button is pressed', () => {
    const onCancel = jest.fn();
    const screen = renderSheet(<ResetConfirmSheet open onCancel={onCancel} onConfirm={() => {}} />);
    fireEvent.press(screen.getByTestId('reset-cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('disables the cancel button while pending', () => {
    const onCancel = jest.fn();
    const screen = renderSheet(
      <ResetConfirmSheet open onCancel={onCancel} onConfirm={() => {}} pending />,
    );
    fireEvent.press(screen.getByTestId('reset-cancel'));
    expect(onCancel).not.toHaveBeenCalled();
  });
});
