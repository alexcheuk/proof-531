import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemeProvider } from '../theme';
import { PrimaryPillButton } from './PrimaryPillButton';
import { SheetLayout } from './SheetLayout';

// The Sheet primitive drives open/close imperatively (snapToIndex/close
// via ref), so the BottomSheet is always mounted in the tree regardless
// of `open`. Render children unconditionally so the existing assertions
// can still inspect sheet contents.
jest.mock('@gorhom/bottom-sheet', () => {
  const { View } = require('react-native');
  const React = require('react');
  return {
    __esModule: true,
    default: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(View, null, children),
    BottomSheetBackdrop: () => null,
    BottomSheetView: ({
      children,
      ...props
    }: { children?: React.ReactNode; [k: string]: unknown }) =>
      React.createElement(View, props, children),
  };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light' },
}));

function renderSheet(node: React.ReactNode) {
  return render(<ThemeProvider>{node}</ThemeProvider>);
}

describe('SheetLayout', () => {
  const baseProps = {
    open: true,
    onDismiss: jest.fn(),
    title: 'Reset everything?',
    primary: (
      <PrimaryPillButton testID="primary" onPress={() => {}}>
        Confirm
      </PrimaryPillButton>
    ),
  };

  it('renders eyebrow + title + body + primary', () => {
    const { getByText, getByTestId } = renderSheet(
      <SheetLayout {...baseProps} eyebrow="CONFIRM">
        <Text>Body copy</Text>
      </SheetLayout>,
    );
    expect(getByText('CONFIRM')).toBeTruthy();
    expect(getByText('Reset everything?')).toBeTruthy();
    expect(getByText('Body copy')).toBeTruthy();
    expect(getByTestId('primary')).toBeTruthy();
  });

  it('fires cancel onPress when ghost cancel is tapped', () => {
    const onCancel = jest.fn();
    const { getByTestId } = renderSheet(
      <SheetLayout
        {...baseProps}
        cancel={{ label: 'Keep my data', onPress: onCancel, testID: 'cancel' }}
      />,
    );
    fireEvent.press(getByTestId('cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('disables cancel while pending', () => {
    const onCancel = jest.fn();
    const { getByTestId } = renderSheet(
      <SheetLayout
        {...baseProps}
        pending
        cancel={{ label: 'Cancel', onPress: onCancel, testID: 'cancel' }}
      />,
    );
    fireEvent.press(getByTestId('cancel'));
    expect(onCancel).not.toHaveBeenCalled();
  });
});
