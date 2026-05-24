import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: jest.fn(), back: jest.fn() }),
}));

import { LiftPageEmpty } from '../LiftPageEmpty';

const renderEmpty = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('LiftPageEmpty', () => {
  beforeEach(() => mockRouterPush.mockClear());

  it('renders the NO TRAINING MAX SET copy + Open settings CTA', () => {
    const screen = renderEmpty(<LiftPageEmpty testIDPrefix="lift-page-squat" />);
    expect(screen.getByText('NO TRAINING MAX SET')).toBeTruthy();
    expect(screen.getByText('Open settings →')).toBeTruthy();
    expect(screen.getByTestId('lift-page-squat-open-settings')).toBeTruthy();
  });

  it('routes to /onboarding when the CTA is pressed', () => {
    const screen = renderEmpty(<LiftPageEmpty testIDPrefix="lift-page-squat" />);
    fireEvent.press(screen.getByTestId('lift-page-squat-open-settings'));
    expect(mockRouterPush).toHaveBeenCalledWith('/onboarding');
  });

  it('omits the testID prefix when no prefix is given', () => {
    const screen = renderEmpty(<LiftPageEmpty />);
    expect(screen.queryByTestId('lift-page-squat-open-settings')).toBeNull();
  });
});
