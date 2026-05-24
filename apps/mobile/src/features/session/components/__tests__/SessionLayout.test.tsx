import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SessionLayout } from '../SessionLayout';

describe('SessionLayout', () => {
  it('renders children inside the paper-themed shell', () => {
    const screen = render(
      <ThemeProvider>
        <SessionLayout>
          <Text testID="child">Hi</Text>
        </SessionLayout>
      </ThemeProvider>,
    );
    expect(screen.getByTestId('child')).toBeTruthy();
    expect(screen.getByText('Hi')).toBeTruthy();
  });

  it('exposes the supplied testID on the root container', () => {
    const screen = render(
      <ThemeProvider>
        <SessionLayout testID="layout-root">
          <Text>x</Text>
        </SessionLayout>
      </ThemeProvider>,
    );
    expect(screen.getByTestId('layout-root')).toBeTruthy();
  });
});
