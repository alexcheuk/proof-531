import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { LogSheetFooter } from '../LogSheetFooter';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const defaults = {
  pending: false,
  onCancel: jest.fn(),
  onSave: jest.fn(),
  cancelTestID: 'cancel-btn',
  saveTestID: 'save-btn',
  cancelA11yLabel: 'Cancel',
  saveA11yLabel: 'Save reps',
};

describe('LogSheetFooter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Cancel and Save buttons', () => {
    const screen = wrap(<LogSheetFooter {...defaults} />);
    expect(screen.getByText('Cancel')).toBeTruthy();
    expect(screen.getByText('Save')).toBeTruthy();
  });

  it('calls onCancel when Cancel is pressed', () => {
    const onCancel = jest.fn();
    const screen = wrap(<LogSheetFooter {...defaults} onCancel={onCancel} />);
    fireEvent.press(screen.getByTestId('cancel-btn'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onSave when Save is pressed', () => {
    const onSave = jest.fn();
    const screen = wrap(<LogSheetFooter {...defaults} onSave={onSave} />);
    fireEvent.press(screen.getByTestId('save-btn'));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('disables both buttons when pending', () => {
    const screen = wrap(<LogSheetFooter {...defaults} pending={true} />);
    expect(screen.getByTestId('cancel-btn').props.accessibilityState?.disabled).toBe(true);
    expect(screen.getByTestId('save-btn').props.accessibilityState?.disabled).toBe(true);
  });

  it('does not call onSave when pressed while pending', () => {
    const onSave = jest.fn();
    const screen = wrap(<LogSheetFooter {...defaults} pending={true} onSave={onSave} />);
    fireEvent.press(screen.getByTestId('save-btn'));
    expect(onSave).not.toHaveBeenCalled();
  });
});
