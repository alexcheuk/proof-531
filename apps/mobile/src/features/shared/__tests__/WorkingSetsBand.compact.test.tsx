/**
 * Behavioral tests for the `compact` (read-only Home) variant of
 * WorkingSetsBand. Asserts row rendering, the week-4 collapse, the inline
 * AMRAP marker, and the composed accessibility labels — not pixels.
 */
import { ThemeProvider } from '@/design/theme';
import { prescription, tmTestSet } from '@/domain/schemes';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { WorkingSetsBand } from '../WorkingSetsBand';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const baseProps = {
  tm: 300,
  storageUnit: 'lbs' as const,
  renderUnit: 'lbs' as const,
  unitGlyph: 'lb' as const,
  tmInDisplay: 300,
};

describe('WorkingSetsBand — compact variant (Home ladder)', () => {
  it('renders three hairline rows for weeks 1–3', () => {
    const screen = wrap(
      <WorkingSetsBand {...baseProps} variant="compact" sets={prescription(1)} />,
    );
    expect(screen.getByTestId('home-ladder-row-0')).toBeTruthy();
    expect(screen.getByTestId('home-ladder-row-1')).toBeTruthy();
    expect(screen.getByTestId('home-ladder-row-2')).toBeTruthy();
    expect(screen.queryByTestId('home-ladder-row-3')).toBeNull();
  });

  it('renders the WORKING SETS header with the TM caption but no done count', () => {
    const screen = wrap(
      <WorkingSetsBand {...baseProps} variant="compact" sets={prescription(1)} />,
    );
    expect(screen.getByText('WORKING SETS')).toBeTruthy();
    expect(screen.getByText('TM 300 lb')).toBeTruthy();
    // The "N OF 3 DONE" chrome is full-variant only.
    expect(screen.queryByText(/DONE/)).toBeNull();
  });

  it('collapses to a single TM-test row on week 4', () => {
    const screen = wrap(<WorkingSetsBand {...baseProps} variant="compact" sets={[tmTestSet()]} />);
    const row = screen.getByTestId('home-ladder-row-0');
    expect(row).toBeTruthy();
    expect(screen.queryByTestId('home-ladder-row-1')).toBeNull();
    // Week-4 row announces the 3–5 rep range as one accessible chunk.
    const node = screen.getByLabelText(/TM test\. .*× 3 to 5 reps/);
    expect(node).toBeTruthy();
  });

  it('emphasises the AMRAP top set as the "Top set" accessible chunk on weeks 1–3', () => {
    const screen = wrap(
      <WorkingSetsBand {...baseProps} variant="compact" sets={prescription(1)} />,
    );
    // The third (AMRAP) row reads as the top set, with the AMRAP spoken.
    expect(screen.getByLabelText(/Top set\. .*reps, AMRAP/)).toBeTruthy();
    // Non-emphasised rows read as "Set N".
    expect(screen.getByLabelText(/^Set 1\./)).toBeTruthy();
  });

  it('honours a custom row testID prefix (used by Home per-lift pages)', () => {
    const screen = wrap(
      <WorkingSetsBand
        {...baseProps}
        variant="compact"
        sets={prescription(1)}
        rowTestIDPrefix="lift-page-squat-ladder-row"
      />,
    );
    expect(screen.getByTestId('lift-page-squat-ladder-row-0')).toBeTruthy();
    expect(screen.getByTestId('lift-page-squat-ladder-row-2')).toBeTruthy();
  });
});
