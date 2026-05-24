/**
 * Behavioral test for SetRow — the working-set row on Today.
 *
 * Covers the four visual states the row encodes via props:
 *   - default (un-done, not-next): index "01", pct, no badge
 *   - done: "✓" glyph, strike-through on weight, reduced opacity
 *   - next: UP NEXT badge + brighter index ink
 *   - amrap: trailing "+" on reps + AMRAP badge
 *   - isLast: bottom hairline border applied
 */
import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SetRow } from '../SetRow';

const renderRow = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('SetRow', () => {
  it('renders the zero-padded index, weight, unit, reps, and pct', () => {
    const screen = renderRow(
      <SetRow
        index={1}
        isLast={false}
        weight={185}
        unit="lbs"
        reps={5}
        amrap={false}
        pct={0.65}
        testID="set-1"
      />,
    );

    expect(screen.getByText('01')).toBeTruthy();
    expect(screen.getByText('185')).toBeTruthy();
    expect(screen.getByText('lb')).toBeTruthy();
    expect(screen.getByText('× 5')).toBeTruthy();
    expect(screen.getByText('65%')).toBeTruthy();
  });

  it('shows the ✓ glyph and strike-through weight when done', () => {
    const screen = renderRow(
      <SetRow
        index={2}
        isLast={false}
        weight={205}
        unit="lbs"
        reps={5}
        amrap={false}
        pct={0.75}
        done
        testID="set-2"
      />,
    );

    expect(screen.getByText('✓')).toBeTruthy();
    const weight = screen.getByText('205');
    const style = Array.isArray(weight.props.style)
      ? Object.assign({}, ...weight.props.style.filter(Boolean))
      : weight.props.style;
    expect(style.textDecorationLine).toBe('line-through');
  });

  it('renders the UP NEXT badge when next', () => {
    const screen = renderRow(
      <SetRow index={3} isLast weight={225} unit="lbs" reps={5} amrap={false} pct={0.85} next />,
    );
    expect(screen.getByText('UP NEXT')).toBeTruthy();
  });

  it('renders the AMRAP badge and a trailing "+" on the reps clause', () => {
    const screen = renderRow(
      <SetRow index={3} isLast weight={225} unit="lbs" reps={5} amrap pct={0.85} />,
    );
    expect(screen.getByText('AMRAP')).toBeTruthy();
    expect(screen.getByText('× 5+')).toBeTruthy();
  });

  it('applies the bottom hairline border when isLast', () => {
    const screen = renderRow(
      <SetRow
        index={3}
        isLast
        weight={225}
        unit="lbs"
        reps={5}
        amrap={false}
        pct={0.85}
        testID="last"
      />,
    );
    const row = screen.getByTestId('last');
    const style = Array.isArray(row.props.style)
      ? Object.assign({}, ...row.props.style.filter(Boolean))
      : row.props.style;
    expect(style.borderBottomWidth).toBe(1);
  });

  it('omits the bottom border when not the last row', () => {
    const screen = renderRow(
      <SetRow
        index={1}
        isLast={false}
        weight={185}
        unit="lbs"
        reps={5}
        amrap={false}
        pct={0.65}
        testID="first"
      />,
    );
    const row = screen.getByTestId('first');
    const style = Array.isArray(row.props.style)
      ? Object.assign({}, ...row.props.style.filter(Boolean))
      : row.props.style;
    expect(style.borderBottomWidth).toBeUndefined();
  });
});
