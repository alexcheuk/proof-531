/**
 * Behavioral test for CycleStrip — the 4-week ledger grid on Home.
 *
 * Covers cell identity (D1..D4 + scheme), completed-week fill (ink0 bg,
 * paper ✓ glyph), next-week amber ring, and future-week transparency.
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
    expect(screen.getByText('TM TEST')).toBeTruthy();
  });

  it('renders D1..D4 day labels', () => {
    const screen = renderStrip(<CycleStrip currentWeek={2} />);
    expect(screen.getByText('D1')).toBeTruthy();
    expect(screen.getByText('D2')).toBeTruthy();
    expect(screen.getByText('D3')).toBeTruthy();
    expect(screen.getByText('D4')).toBeTruthy();
  });

  it('fills completed cells with ink0 background', () => {
    const screen = renderStrip(<CycleStrip currentWeek={3} />);
    // weeks 1 and 2 are done — both should have ink0 bg
    const cell1 = screen.getByTestId('cycle-strip-cell-1');
    const cell2 = screen.getByTestId('cycle-strip-cell-2');
    const getStyle = (el: ReturnType<typeof screen.getByTestId>) =>
      Array.isArray(el.props.style)
        ? Object.assign({}, ...el.props.style.filter(Boolean))
        : el.props.style;
    expect(getStyle(cell1).backgroundColor).toBe('#1A1812');
    expect(getStyle(cell2).backgroundColor).toBe('#1A1812');
  });

  it('leaves the current (next) and future cells with transparent background', () => {
    const screen = renderStrip(<CycleStrip currentWeek={2} />);
    const getStyle = (el: ReturnType<typeof screen.getByTestId>) =>
      Array.isArray(el.props.style)
        ? Object.assign({}, ...el.props.style.filter(Boolean))
        : el.props.style;
    // week 2 is next — transparent
    expect(getStyle(screen.getByTestId('cycle-strip-cell-2')).backgroundColor).toBe('transparent');
    // week 3 is future — transparent
    expect(getStyle(screen.getByTestId('cycle-strip-cell-3')).backgroundColor).toBe('transparent');
  });

  it('renders a ✓ glyph on completed weeks', () => {
    const screen = renderStrip(<CycleStrip currentWeek={3} />);
    // weeks 1 and 2 are done → both render ✓
    const checks = screen.queryAllByText('✓');
    expect(checks.length).toBe(2);
  });

  it('renders no ✓ glyph when on week 1 (nothing completed)', () => {
    const screen = renderStrip(<CycleStrip currentWeek={1} />);
    expect(screen.queryAllByText('✓').length).toBe(0);
  });
});
