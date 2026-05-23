import { render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { ThemeProvider } from '../theme';
import { colors } from '../tokens';
import { SectionBand } from './SectionBand';

const wrap = (ui: React.ReactNode) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('SectionBand', () => {
  it('renders children inside', () => {
    const { getByText } = wrap(
      <SectionBand testID="band">
        <Text>inside</Text>
      </SectionBand>,
    );
    expect(getByText('inside')).toBeTruthy();
  });

  it('default tone: top=lineStrong, bottom=line', () => {
    const { getByTestId } = wrap(
      <SectionBand testID="band">
        <Text>x</Text>
      </SectionBand>,
    );
    const style = StyleSheet.flatten(getByTestId('band').props.style);
    expect(style.borderTopColor).toBe(colors.lineStrong);
    expect(style.borderBottomColor).toBe(colors.line);
    expect(style.borderTopWidth).toBe(1);
    expect(style.borderBottomWidth).toBe(1);
  });

  it('tone="strong": both lineStrong', () => {
    const { getByTestId } = wrap(
      <SectionBand testID="band" tone="strong">
        <Text>x</Text>
      </SectionBand>,
    );
    const style = StyleSheet.flatten(getByTestId('band').props.style);
    expect(style.borderTopColor).toBe(colors.lineStrong);
    expect(style.borderBottomColor).toBe(colors.lineStrong);
  });

  it('tone="faint": both line', () => {
    const { getByTestId } = wrap(
      <SectionBand testID="band" tone="faint">
        <Text>x</Text>
      </SectionBand>,
    );
    const style = StyleSheet.flatten(getByTestId('band').props.style);
    expect(style.borderTopColor).toBe(colors.line);
    expect(style.borderBottomColor).toBe(colors.line);
  });

  it('padding="default" → paddingVertical 20', () => {
    const { getByTestId } = wrap(
      <SectionBand testID="band">
        <Text>x</Text>
      </SectionBand>,
    );
    const style = StyleSheet.flatten(getByTestId('band').props.style);
    expect(style.paddingVertical).toBe(20);
  });

  it('padding="tight" → paddingVertical 14', () => {
    const { getByTestId } = wrap(
      <SectionBand testID="band" padding="tight">
        <Text>x</Text>
      </SectionBand>,
    );
    const style = StyleSheet.flatten(getByTestId('band').props.style);
    expect(style.paddingVertical).toBe(14);
  });

  it('padding="none" → paddingVertical 0', () => {
    const { getByTestId } = wrap(
      <SectionBand testID="band" padding="none">
        <Text>x</Text>
      </SectionBand>,
    );
    const style = StyleSheet.flatten(getByTestId('band').props.style);
    expect(style.paddingVertical).toBe(0);
  });

  it('merges user-supplied style last (backgroundColor)', () => {
    const { getByTestId } = wrap(
      <SectionBand testID="band" style={{ backgroundColor: '#ff0000' }}>
        <Text>x</Text>
      </SectionBand>,
    );
    const style = StyleSheet.flatten(getByTestId('band').props.style);
    expect(style.backgroundColor).toBe('#ff0000');
  });
});
