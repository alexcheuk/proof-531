import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SessionTopBar } from '../SessionTopBar';

const renderBar = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('SessionTopBar', () => {
  it('renders the back chip with the ← glyph and default a11y label', () => {
    const screen = renderBar(<SessionTopBar onBack={() => {}} />);
    const back = screen.getByTestId('session-back');
    expect(back).toBeTruthy();
    expect(back.props.accessibilityLabel).toBe('Back to Home');
    expect(screen.getByText('←')).toBeTruthy();
  });

  it('fires onBack when the back chip is pressed', () => {
    const onBack = jest.fn();
    const screen = renderBar(<SessionTopBar onBack={onBack} />);
    fireEvent.press(screen.getByTestId('session-back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders no right-side action by default', () => {
    const screen = renderBar(<SessionTopBar onBack={() => {}} />);
    expect(screen.queryByTestId('session-complete')).toBeNull();
  });

  it('renders the Complete-session pill when rightAction.kind = "complete"', () => {
    const onPress = jest.fn();
    const screen = renderBar(
      <SessionTopBar onBack={() => {}} rightAction={{ kind: 'complete', onPress }} />,
    );
    const pill = screen.getByTestId('session-complete');
    expect(pill).toBeTruthy();
    expect(screen.getByText('Complete session')).toBeTruthy();
    fireEvent.press(pill);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('forwards a custom backLabel to the back chip a11y label', () => {
    const screen = renderBar(<SessionTopBar onBack={() => {}} backLabel="Exit session" />);
    expect(screen.getByTestId('session-back').props.accessibilityLabel).toBe('Exit session');
  });
});
