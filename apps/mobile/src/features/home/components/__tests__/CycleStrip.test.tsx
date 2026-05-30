import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { CycleStrip } from '../CycleStrip';

const renderStrip = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('CycleStrip', () => {
  it('renders the THIS CYCLE eyebrow + all four day cells', () => {
    const screen = renderStrip(<CycleStrip currentDay={1} />);
    expect(screen.getByText('THIS CYCLE')).toBeTruthy();
    expect(screen.getByTestId('cycle-strip-cell-1')).toBeTruthy();
    expect(screen.getByTestId('cycle-strip-cell-2')).toBeTruthy();
    expect(screen.getByTestId('cycle-strip-cell-3')).toBeTruthy();
    expect(screen.getByTestId('cycle-strip-cell-4')).toBeTruthy();
  });

  it("renders each day's scheme text", () => {
    const screen = renderStrip(<CycleStrip currentDay={1} />);
    expect(screen.getByText('5·5·5+')).toBeTruthy();
    expect(screen.getByText('3·3·3+')).toBeTruthy();
    expect(screen.getByText('5·3·1+')).toBeTruthy();
    expect(screen.getByText('TM TEST')).toBeTruthy();
  });

  it('renders D1..D4 day labels', () => {
    const screen = renderStrip(<CycleStrip currentDay={2} />);
    expect(screen.getByText('D1')).toBeTruthy();
    expect(screen.getByText('D2')).toBeTruthy();
    expect(screen.getByText('D3')).toBeTruthy();
    expect(screen.getByText('D4')).toBeTruthy();
  });

  it('shows ✓ glyph on completed days and no ✓ on current or future days', () => {
    const screen = renderStrip(<CycleStrip currentDay={3} />);
    // days 1 and 2 are done → exactly 2 checkmarks
    expect(screen.queryAllByText('✓').length).toBe(2);
    // day 3 (current) and day 4 (future) do not show ✓
    expect(screen.getByTestId('cycle-strip-cell-3')).toBeTruthy();
    expect(screen.getByTestId('cycle-strip-cell-4')).toBeTruthy();
  });

  it('renders no ✓ glyph when on day 1 (nothing completed)', () => {
    const screen = renderStrip(<CycleStrip currentDay={1} />);
    expect(screen.queryAllByText('✓').length).toBe(0);
  });

  it('renders exactly one ✓ glyph when on day 2 (only day 1 done)', () => {
    const screen = renderStrip(<CycleStrip currentDay={2} />);
    expect(screen.queryAllByText('✓').length).toBe(1);
  });
});
