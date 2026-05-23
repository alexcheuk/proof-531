import { render } from '@testing-library/react-native';
import { Text as RNText, StyleSheet } from 'react-native';
import { ThemeProvider } from '../theme';
import { colors } from '../tokens';
import { Masthead } from './Masthead';

const wrap = (ui: React.ReactNode) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('Masthead', () => {
  it('renders 531 and ledger wordmark text', () => {
    const { getByText } = wrap(<Masthead />);
    expect(getByText('531')).toBeTruthy();
    expect(getByText('ledger')).toBeTruthy();
  });

  it('underline="hairline" applies bottom border using colors.line', () => {
    const { getByTestId } = wrap(<Masthead testID="mh" underline="hairline" />);
    const style = StyleSheet.flatten(getByTestId('mh').props.style);
    expect(style.borderBottomWidth).toBe(1);
    expect(style.borderBottomColor).toBe(colors.line);
  });

  it('underline defaults to "none" → no bottom border', () => {
    const { getByTestId } = wrap(<Masthead testID="mh" />);
    const style = StyleSheet.flatten(getByTestId('mh').props.style);
    expect(style.borderBottomWidth).toBeUndefined();
  });

  it('renders rightSlot content when provided', () => {
    const { getByText } = wrap(<Masthead rightSlot={<RNText>{'settings'}</RNText>} />);
    expect(getByText('settings')).toBeTruthy();
  });

  it('forwards testID to the container', () => {
    const { getByTestId } = wrap(<Masthead testID="mh" />);
    expect(getByTestId('mh')).toBeTruthy();
  });
});
