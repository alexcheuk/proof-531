/**
 * Behavioral test for SetPhase  -  the live mid-set composition.
 *
 * Confirms LiveHeader props flow through (lift label, elapsed clock,
 * AMRAP chip), the TopSetBlock renders weight / unit / pct eyebrow,
 * and the optional plate-change hint only appears when supplied.
 */
import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SetPhase } from '../SetPhase';

const renderPhase = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const BASE = {
  liftLabel: 'Squat',
  elapsedSeconds: 75,
  weight: 225,
  reps: 5,
  pct: 0.85,
  unit: 'lbs' as const,
  perSide: [45, 25, 10] as ReadonlyArray<number>,
};

describe('SetPhase', () => {
  it('renders the LiveHeader with lift label and elapsed clock', () => {
    const screen = renderPhase(<SetPhase setIndex={0} isAmrap={false} {...BASE} />);
    expect(screen.getByTestId('live-header')).toBeTruthy();
    expect(screen.getByText(/Squat/)).toBeTruthy();
    expect(screen.getByText('01:15')).toBeTruthy();
    expect(screen.getByText('SET 1 OF 3')).toBeTruthy();
  });

  it('renders the TopSetBlock with pct eyebrow + weight + unit', () => {
    const screen = renderPhase(<SetPhase setIndex={1} isAmrap={false} {...BASE} />);
    expect(screen.getByTestId('live-bigweight')).toBeTruthy();
    expect(screen.getByText('On the bar · 85% TM')).toBeTruthy();
    expect(screen.getByText('225')).toBeTruthy();
  });

  it('renders the 33% done progress hint on set 2', () => {
    const screen = renderPhase(<SetPhase setIndex={1} isAmrap={false} {...BASE} />);
    expect(screen.getByText('SET 2 OF 3 · 33% done')).toBeTruthy();
  });

  it('renders the FINAL SET eyebrow + AMRAP chip on set 3', () => {
    const screen = renderPhase(<SetPhase setIndex={2} isAmrap {...BASE} />);
    expect(screen.getByText(/FINAL SET/)).toBeTruthy();
    expect(screen.getByText('FINAL SET · 66% done')).toBeTruthy();
    expect(screen.getByText('AMRAP')).toBeTruthy();
  });

  it('renders the AMRAP coaching banner inside LiveHeader only when isAmrap', () => {
    // The banner moved from the SetPhase body into LiveHeader so it sits
    // next to the AMRAP chip  -  testID is now `live-amrap-coaching`.
    const amrap = renderPhase(<SetPhase setIndex={2} isAmrap {...BASE} />);
    expect(amrap.getByTestId('live-amrap-coaching')).toBeTruthy();

    const regular = renderPhase(<SetPhase setIndex={0} isAmrap={false} {...BASE} />);
    expect(regular.queryByTestId('live-amrap-coaching')).toBeNull();
  });

  it('renders the plate-change hint when provided', () => {
    const screen = renderPhase(
      <SetPhase
        setIndex={1}
        isAmrap={false}
        plateChangeHint="+10 lb per side vs set 1"
        {...BASE}
      />,
    );
    expect(screen.getByTestId('live-plate-change-hint')).toBeTruthy();
    expect(screen.getByText('+10 lb per side vs set 1')).toBeTruthy();
  });

  it('omits the plate-change hint when undefined', () => {
    const screen = renderPhase(<SetPhase setIndex={0} isAmrap={false} {...BASE} />);
    expect(screen.queryByTestId('live-plate-change-hint')).toBeNull();
  });
});
