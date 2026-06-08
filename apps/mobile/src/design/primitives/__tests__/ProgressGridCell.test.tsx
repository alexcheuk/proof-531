/**
 * Behavior test for ProgressGridCell's secondary line. Day-4 TM-test cells
 * must show BOTH the direction marker and the rep count ("↑ × 5"), so a lifter
 * sees how many reps they hit and whether the TM moves
 * (Discord #task-queue 1513375762559008789).
 */
import { ProgressGridCell } from '@/design/primitives/ProgressGridCell';
import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

function renderCell(ui: ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('ProgressGridCell secondary line', () => {
  it('shows marker and reps together on a TM-test cell', () => {
    const { getByText } = renderCell(
      <ProgressGridCell variant="past" weight={230} reps={5} marker="↑" />,
    );
    expect(getByText('↑ × 5')).toBeTruthy();
  });

  it('shows just the rep count on an AMRAP cell (no marker)', () => {
    const { getByText } = renderCell(
      <ProgressGridCell variant="past" weight={195} reps={8} marker={null} />,
    );
    expect(getByText('× 8')).toBeTruthy();
  });

  it('shows just the marker when there are no reps', () => {
    const { getByText } = renderCell(
      <ProgressGridCell variant="past" weight={230} reps={null} marker="✓" />,
    );
    expect(getByText('✓')).toBeTruthy();
  });
});
