import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { ThemeProvider } from '../theme';
import { TopSetBlock, type TopSetBlockProps } from './TopSetBlock';

const wrap = (ui: React.ReactNode) => render(<ThemeProvider>{ui}</ThemeProvider>);

const flat = (style: unknown) => StyleSheet.flatten(style) ?? {};

const baseProps: TopSetBlockProps = {
  weight: 225,
  unitGlyph: 'lb',
  reps: 5,
  amrap: false,
  pctLabel: '85%',
  tmLabel: 'TM 245',
  perSide: [45, 45, 25],
  plateVariant: 'full',
  testID: 'tsb',
};

const childText = (node: { children: ReadonlyArray<unknown> }) =>
  node.children
    .map((c) => (typeof c === 'string' || typeof c === 'number' ? String(c) : ''))
    .join('');

describe('TopSetBlock', () => {
  it('renders the "TOP SET" eyebrow and the pct · tm meta', () => {
    const { getByText } = wrap(<TopSetBlock {...baseProps} />);
    expect(getByText('TOP SET')).toBeTruthy();
    expect(getByText('85% · TM 245')).toBeTruthy();
  });

  it('renders the weight as text and the unitGlyph', () => {
    const { getByTestId } = wrap(<TopSetBlock {...baseProps} />);
    const weight = getByTestId('tsb-weight') as unknown as {
      children: ReadonlyArray<unknown>;
    };
    expect(childText(weight)).toBe('225');
    const unit = getByTestId('tsb-unit') as unknown as {
      children: ReadonlyArray<unknown>;
    };
    expect(childText(unit)).toBe('lb');
  });

  it('renders "× reps" without "+" when amrap is false', () => {
    const { getByTestId } = wrap(<TopSetBlock {...baseProps} reps={5} amrap={false} />);
    const reps = getByTestId('tsb-reps') as unknown as {
      children: ReadonlyArray<unknown>;
    };
    expect(childText(reps)).toBe('× 5');
  });

  it('renders "× reps+" when amrap is true', () => {
    const { getByTestId } = wrap(<TopSetBlock {...baseProps} reps={5} amrap />);
    const reps = getByTestId('tsb-reps') as unknown as {
      children: ReadonlyArray<unknown>;
    };
    expect(childText(reps)).toBe('× 5+');
  });

  it('forwards a PlateBar with the matching testID', () => {
    const { getByTestId } = wrap(<TopSetBlock {...baseProps} />);
    expect(getByTestId('tsb-plate-bar')).toBeTruthy();
    expect(getByTestId('tsb-plate-bar-bar')).toBeTruthy();
  });

  it('bordered=true wraps content in a SectionBand (renders top + bottom hairlines)', () => {
    const { getByTestId } = wrap(<TopSetBlock {...baseProps} bordered />);
    const root = getByTestId('tsb');
    const style = flat(root.props.style) as {
      borderTopWidth?: number;
      borderBottomWidth?: number;
      paddingTop?: number;
      paddingBottom?: number;
    };
    expect(style.borderTopWidth).toBe(1);
    expect(style.borderBottomWidth).toBe(1);
    expect(style.paddingTop).toBe(14);
    expect(style.paddingBottom).toBe(18);
  });

  it('bordered=false (default) does not render the SectionBand hairlines on the root', () => {
    const { getByTestId } = wrap(<TopSetBlock {...baseProps} />);
    const root = getByTestId('tsb');
    const style = flat(root.props.style) as { borderTopWidth?: number };
    expect(style.borderTopWidth).toBeUndefined();
  });

  it('mini plateVariant scales the weight font size down to 56', () => {
    const { getByTestId } = wrap(<TopSetBlock {...baseProps} plateVariant="mini" />);
    const weight = getByTestId('tsb-weight');
    const style = flat(weight.props.style) as { fontSize?: number };
    expect(style.fontSize).toBe(56);
  });

  it('full plateVariant uses the hero weight font size of 64', () => {
    const { getByTestId } = wrap(<TopSetBlock {...baseProps} plateVariant="full" />);
    const weight = getByTestId('tsb-weight');
    const style = flat(weight.props.style) as { fontSize?: number };
    expect(style.fontSize).toBe(64);
  });
});
