/**
 * Behavioral test for CycleStrip — the 4-week ledger grid on Home.
 *
 * Covers cell identity (D1..D4 + scheme), active-week inversion (eyebrow
 * uses paperMuted on ink-on-paper-inverted), done-week ✓ corner glyph,
 * and the eyebrow label "THIS CYCLE".
 */
import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { CycleStrip } from '../CycleStrip';

const renderStrip = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('CycleStrip', () => {
  it('renders the THIS CYCLE eyebrow + all four week cells', () => {
    const screen = renderStrip(<CycleStrip currentWeek={1} />);
    expect(screen.getByText('THIS CYCLE')).toBeTruthy();
    expect(screen.getByTestId('cycle-strip-cell-1')).toBeTruthy();
    expect(screen.getByTestId('cycle-strip-cell-2')).toBeTruthy();
    expect(screen.getByTestId('cycle-strip-cell-3')).toBeTruthy();
    expect(screen.getByTestId('cycle-strip-cell-4')).toBeTruthy();
  });

  it("renders each week's scheme text", () => {
    const screen = renderStrip(<CycleStrip currentWeek={1} />);
    expect(screen.getByText('5·5·5+')).toBeTruthy();
    expect(screen.getByText('3·3·3+')).toBeTruthy();
    expect(screen.getByText('5·3·1+')).toBeTruthy();
    expect(screen.getByText('Deload')).toBeTruthy();
  });

  it('renders D1..D4 day labels', () => {
    const screen = renderStrip(<CycleStrip currentWeek={2} />);
    expect(screen.getByText('D1')).toBeTruthy();
    expect(screen.getByText('D2')).toBeTruthy();
    expect(screen.getByText('D3')).toBeTruthy();
    expect(screen.getByText('D4')).toBeTruthy();
  });

  it('inverts the active cell background (week 3 → ink0 bg)', () => {
    const screen = renderStrip(<CycleStrip currentWeek={3} />);
    const cell = screen.getByTestId('cycle-strip-cell-3');
    const style = Array.isArray(cell.props.style)
      ? Object.assign({}, ...cell.props.style.filter(Boolean))
      : cell.props.style;
    // active background = colors.ink0 ('#1A1812')
    expect(style.backgroundColor).toBe('#1A1812');
  });

  it('leaves non-active cells with transparent background', () => {
    const screen = renderStrip(<CycleStrip currentWeek={1} />);
    const cell = screen.getByTestId('cycle-strip-cell-2');
    const style = Array.isArray(cell.props.style)
      ? Object.assign({}, ...cell.props.style.filter(Boolean))
      : cell.props.style;
    expect(style.backgroundColor).toBe('transparent');
  });

  it('renders a ✓ corner glyph on past weeks', () => {
    const screen = renderStrip(<CycleStrip currentWeek={3} />);
    // weeks 1 and 2 are "done" → both should render a ✓
    const checks = screen.queryAllByText('✓');
    expect(checks.length).toBe(2);
  });

  it('renders no ✓ glyph when on week 1', () => {
    const screen = renderStrip(<CycleStrip currentWeek={1} />);
    expect(screen.queryAllByText('✓').length).toBe(0);
  });
});
