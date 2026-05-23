import { render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { ThemeProvider } from '../theme';
import { colors } from '../tokens';
import { CtaBar } from './CtaBar';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 34, left: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const wrap = (ui: React.ReactNode) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('CtaBar', () => {
  it('renders children', () => {
    const { getByText } = wrap(
      <CtaBar testID="cta">
        <Text>Go</Text>
      </CtaBar>,
    );
    expect(getByText('Go')).toBeTruthy();
  });

  it('safeArea=true (default): paddingBottom = bottom inset + 16 (= 50)', () => {
    const { getByTestId } = wrap(
      <CtaBar testID="cta">
        <Text>x</Text>
      </CtaBar>,
    );
    const style = StyleSheet.flatten(getByTestId('cta').props.style);
    expect(style.paddingBottom).toBe(50);
  });

  it('safeArea=false: paddingBottom = 16', () => {
    const { getByTestId } = wrap(
      <CtaBar testID="cta" safeArea={false}>
        <Text>x</Text>
      </CtaBar>,
    );
    const style = StyleSheet.flatten(getByTestId('cta').props.style);
    expect(style.paddingBottom).toBe(16);
  });

  it('container backgroundColor = colors.bg0', () => {
    const { getByTestId } = wrap(
      <CtaBar testID="cta">
        <Text>x</Text>
      </CtaBar>,
    );
    const style = StyleSheet.flatten(getByTestId('cta').props.style);
    expect(style.backgroundColor).toBe(colors.bg0);
  });

  it('paddingHorizontal = 24, paddingTop = 16', () => {
    const { getByTestId } = wrap(
      <CtaBar testID="cta">
        <Text>x</Text>
      </CtaBar>,
    );
    const style = StyleSheet.flatten(getByTestId('cta').props.style);
    expect(style.paddingHorizontal).toBe(24);
    expect(style.paddingTop).toBe(16);
  });

  it('forwards testID', () => {
    const { getByTestId } = wrap(
      <CtaBar testID="my-cta">
        <Text>x</Text>
      </CtaBar>,
    );
    expect(getByTestId('my-cta')).toBeTruthy();
  });

  it('merges user-supplied style last', () => {
    const { getByTestId } = wrap(
      <CtaBar testID="cta" style={{ backgroundColor: '#ff0000' }}>
        <Text>x</Text>
      </CtaBar>,
    );
    const style = StyleSheet.flatten(getByTestId('cta').props.style);
    expect(style.backgroundColor).toBe('#ff0000');
  });
});
