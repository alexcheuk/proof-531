import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { ThemeProvider } from '../theme';
import { PlateBar } from './PlateBar';

const wrap = (ui: React.ReactNode) => render(<ThemeProvider>{ui}</ThemeProvider>);

const flat = (style: unknown) => StyleSheet.flatten(style) ?? {};
const heightOf = (node: { props: { style?: unknown } }) =>
  (flat(node.props.style) as { height?: number }).height;
const widthOf = (node: { props: { style?: unknown } }) =>
  (flat(node.props.style) as { width?: number }).width;

describe('PlateBar', () => {
  it('renders one View per plate (3 per side → 6 total)', () => {
    const { getAllByTestId } = wrap(
      <PlateBar testID="pb" perSide={[45, 45, 25]} unitGlyph="lb" weight={185} />,
    );
    const plates = getAllByTestId(/^pb-plate-[lr]-\d+$/);
    expect(plates).toHaveLength(6);
  });

  it('renders collars and bar middle when there are plates', () => {
    const { getByTestId } = wrap(
      <PlateBar testID="pb" perSide={[45]} unitGlyph="lb" weight={135} />,
    );
    expect(getByTestId('pb-collar-l')).toBeTruthy();
    expect(getByTestId('pb-collar-r')).toBeTruthy();
    expect(getByTestId('pb-bar')).toBeTruthy();
  });

  it('plate height scales with plate weight (heavier → taller)', () => {
    const { getByTestId } = wrap(
      <PlateBar testID="pb" perSide={[45, 25]} unitGlyph="lb" weight={145} />,
    );
    const big = getByTestId('pb-plate-l-0'); // 45 lb
    const small = getByTestId('pb-plate-l-1'); // 25 lb
    const bigH = heightOf(big);
    const smallH = heightOf(small);
    expect(bigH).toBeGreaterThan(0);
    expect(smallH).toBeGreaterThan(0);
    expect(bigH).toBeGreaterThan(smallH as number);
  });

  it('empty perSide renders only the bar middle (no collars, no plates)', () => {
    const { getByTestId, queryByTestId, queryAllByTestId } = wrap(
      <PlateBar testID="pb" perSide={[]} unitGlyph="lb" weight={45} />,
    );
    expect(getByTestId('pb-bar')).toBeTruthy();
    expect(queryByTestId('pb-collar-l')).toBeNull();
    expect(queryByTestId('pb-collar-r')).toBeNull();
    expect(queryAllByTestId(/^pb-plate-[lr]-\d+$/)).toHaveLength(0);
  });

  it('mini=true uses smaller bar-row height (64) and plate width (9)', () => {
    const { getByTestId } = wrap(
      <PlateBar testID="pb" perSide={[45]} unitGlyph="lb" weight={135} mini />,
    );
    expect(heightOf(getByTestId('pb-row'))).toBe(64);
    expect(widthOf(getByTestId('pb-plate-l-0'))).toBe(9);
  });

  it('full variant uses larger bar-row height (96) and plate width (16)', () => {
    const { getByTestId } = wrap(
      <PlateBar testID="pb" perSide={[45]} unitGlyph="lb" weight={135} />,
    );
    expect(heightOf(getByTestId('pb-row'))).toBe(96);
    expect(widthOf(getByTestId('pb-plate-l-0'))).toBe(16);
  });

  it('PER SIDE row renders in full variant  -  groups equal adjacent plates with grouped count', () => {
    const { getByTestId, getByText, getAllByText } = wrap(
      <PlateBar testID="pb" perSide={[45, 45, 25]} unitGlyph="lb" weight={185} />,
    );
    expect(getByTestId('pb-caption')).toBeTruthy();
    // "PER SIDE" label sits on the left.
    expect(getByText('PER SIDE')).toBeTruthy();
    // Two 45s collapse to "2× " + "45"; one 25 stays as a bare "25". The
    // weight numerics appear both as in-plate stamps AND in the PER SIDE
    // numerics  -  `getAllByText` confirms each shows up at least once.
    expect(getByText(/^2×/)).toBeTruthy();
    expect(getAllByText('45').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('25').length).toBeGreaterThanOrEqual(1);
    // Total bumps to per-side sum + unit.
    expect(getByText('= 115 lb')).toBeTruthy();
  });

  it('stamps the weight number onto plates that are tall enough to read', () => {
    const { getAllByText } = wrap(
      <PlateBar testID="pb" perSide={[45, 45]} unitGlyph="lb" weight={225} />,
    );
    // Each 45 plate stamps its own "45" label; with 2 per side that's 4 stamps.
    // The PER SIDE row also renders "45" once → at least 4 matches expected.
    expect(getAllByText('45').length).toBeGreaterThanOrEqual(4);
  });

  it('PER SIDE row is hidden when mini', () => {
    const { queryByTestId } = wrap(
      <PlateBar testID="pb" perSide={[45, 45]} unitGlyph="lb" weight={225} mini />,
    );
    expect(queryByTestId('pb-caption')).toBeNull();
  });

  it('PER SIDE row renders an em-dash placeholder when there are no plates', () => {
    const { getByTestId, getByText } = wrap(
      <PlateBar testID="pb" perSide={[]} unitGlyph="lb" weight={45} />,
    );
    expect(getByTestId('pb-caption')).toBeTruthy();
    expect(getByText('PER SIDE')).toBeTruthy();
    expect(getByText(' - ')).toBeTruthy();
  });

  it('accessibilityLabel includes weight and unitGlyph (loaded with plates)', () => {
    const { getByTestId } = wrap(
      <PlateBar testID="pb" perSide={[45, 25]} unitGlyph="lb" weight={185} />,
    );
    const root = getByTestId('pb');
    const label = root.props.accessibilityLabel as string;
    expect(label).toContain('185');
    expect(label).toContain('lb');
    expect(label).toContain('per side');
  });

  it('accessibilityLabel for empty bar reads "bar only"', () => {
    const { getByTestId } = wrap(<PlateBar testID="pb" perSide={[]} unitGlyph="kg" weight={20} />);
    const root = getByTestId('pb');
    const label = root.props.accessibilityLabel as string;
    expect(label).toContain('20');
    expect(label).toContain('kg');
    expect(label).toContain('bar only');
  });
});
