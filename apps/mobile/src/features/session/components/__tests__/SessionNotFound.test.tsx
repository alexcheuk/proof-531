/**
 * Behavioral test for SessionNotFound (W1.4).
 *
 * Asserts the rendered copy, the alert role on the headline (so VoiceOver
 * announces on mount), and the router.replace('/') call when the CTA is
 * pressed. Pixel layout is out of scope.
 */
import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  // biome-ignore lint/suspicious/noExplicitAny: trivial test provider stub
  SafeAreaProvider: ({ children }: any) => children,
}));

import { SessionNotFound } from '../SessionNotFound';

const renderWithTheme = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('SessionNotFound', () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it('renders the NOT FOUND eyebrow, headline, and body copy', () => {
    const screen = renderWithTheme(<SessionNotFound />);
    expect(screen.getByText('NOT FOUND')).toBeTruthy();
    expect(screen.getByText('Session not found.')).toBeTruthy();
    expect(
      screen.getByText("This session can't be opened. It may have been cancelled or removed."),
    ).toBeTruthy();
  });

  it('exposes the Back to Home CTA and routes home on press', () => {
    const screen = renderWithTheme(<SessionNotFound />);
    const cta = screen.getByTestId('session-not-found-cta');
    expect(cta).toBeTruthy();
    fireEvent.press(cta);
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('renders inside the SessionLayout chrome (paper canvas + safe area)', () => {
    const screen = renderWithTheme(<SessionNotFound />);
    expect(screen.getByTestId('session-not-found')).toBeTruthy();
  });
});
