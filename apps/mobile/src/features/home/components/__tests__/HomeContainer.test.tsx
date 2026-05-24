import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { HomeContainer } from '../HomeContainer';

describe('HomeContainer', () => {
  it('renders children inside a paper-themed shell', () => {
    const screen = render(
      <ThemeProvider>
        <HomeContainer>
          <Text testID="child">Hi</Text>
        </HomeContainer>
      </ThemeProvider>,
    );
    expect(screen.getByTestId('child')).toBeTruthy();
    expect(screen.getByText('Hi')).toBeTruthy();
  });
});
