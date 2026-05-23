import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { ThemeProvider } from '../theme';
import { colors } from '../tokens';
import { TitleBlock } from './TitleBlock';

const wrap = (ui: React.ReactNode) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('TitleBlock', () => {
  it('renders eyebrow and title text', () => {
    const { getByText } = wrap(<TitleBlock eyebrow="HISTORY" title="All Sessions" />);
    expect(getByText('HISTORY')).toBeTruthy();
    expect(getByText('All Sessions')).toBeTruthy();
  });

  it('eyebrow style: mono medium, uppercase, ink2', () => {
    const { getByText } = wrap(<TitleBlock eyebrow="HISTORY" title="All Sessions" />);
    const style = StyleSheet.flatten(getByText('HISTORY').props.style);
    expect(style.fontFamily).toBe('IBMPlexMono-Medium');
    expect(style.textTransform).toBe('uppercase');
    expect(style.color).toBe(colors.ink2);
  });

  it('title style: sans bold, 28px, ink0', () => {
    const { getByText } = wrap(<TitleBlock eyebrow="HISTORY" title="All Sessions" />);
    const style = StyleSheet.flatten(getByText('All Sessions').props.style);
    expect(style.fontFamily).toBe('IBMPlexSans-Bold');
    expect(style.fontSize).toBe(28);
    expect(style.color).toBe(colors.ink0);
  });

  it('container has bottom hairline using lineStrong', () => {
    const { getByTestId } = wrap(<TitleBlock testID="tb" eyebrow="HISTORY" title="All Sessions" />);
    const style = StyleSheet.flatten(getByTestId('tb').props.style);
    expect(style.borderBottomWidth).toBe(1);
    expect(style.borderBottomColor).toBe(colors.lineStrong);
  });
});
