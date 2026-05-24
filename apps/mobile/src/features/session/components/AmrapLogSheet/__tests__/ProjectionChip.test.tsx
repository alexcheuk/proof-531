import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { ProjectionChip } from '../ProjectionChip';

const renderChip = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ProjectionChip', () => {
  it('renders the EST. 1RM caption with the supplied unit', () => {
    const screen = renderChip(
      <ProjectionChip
        predictedE1RM={245}
        unit="lbs"
        deltaFromBest={null}
        reps={5}
        isPotentialPR={false}
      />,
    );
    expect(screen.getByText('EST. 1RM 245 lb')).toBeTruthy();
  });

  it('renders the kg suffix when unit is kg', () => {
    const screen = renderChip(
      <ProjectionChip
        predictedE1RM={110}
        unit="kg"
        deltaFromBest={null}
        reps={3}
        isPotentialPR={false}
      />,
    );
    expect(screen.getByText('EST. 1RM 110 kg')).toBeTruthy();
  });

  it('omits the delta chip when deltaFromBest is null', () => {
    const screen = renderChip(
      <ProjectionChip
        predictedE1RM={200}
        unit="lbs"
        deltaFromBest={null}
        reps={5}
        isPotentialPR={false}
      />,
    );
    expect(screen.queryByTestId('amrap-delta-chip')).toBeNull();
  });

  it('omits the delta chip when reps is 0', () => {
    const screen = renderChip(
      <ProjectionChip
        predictedE1RM={200}
        unit="lbs"
        deltaFromBest={5}
        reps={0}
        isPotentialPR={false}
      />,
    );
    expect(screen.queryByTestId('amrap-delta-chip')).toBeNull();
  });

  it('renders ↑ +12 when the projection is over the prior best', () => {
    const screen = renderChip(
      <ProjectionChip predictedE1RM={250} unit="lbs" deltaFromBest={12} reps={5} isPotentialPR />,
    );
    expect(screen.getByTestId('amrap-delta-chip')).toBeTruthy();
    expect(screen.getByText('↑ +12')).toBeTruthy();
  });

  it('renders ↓ N when the projection trails the prior best', () => {
    const screen = renderChip(
      <ProjectionChip
        predictedE1RM={230}
        unit="lbs"
        deltaFromBest={-8}
        reps={5}
        isPotentialPR={false}
      />,
    );
    expect(screen.getByText('↓ 8')).toBeTruthy();
  });

  it('renders the PR badge only when isPotentialPR is true', () => {
    const off = renderChip(
      <ProjectionChip
        predictedE1RM={200}
        unit="lbs"
        deltaFromBest={null}
        reps={5}
        isPotentialPR={false}
      />,
    );
    expect(off.queryByTestId('amrap-pr-badge')).toBeNull();

    const on = renderChip(
      <ProjectionChip predictedE1RM={300} unit="lbs" deltaFromBest={20} reps={8} isPotentialPR />,
    );
    expect(on.getByTestId('amrap-pr-badge')).toBeTruthy();
  });
});
