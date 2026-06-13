import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { ReceiptCard } from '../ReceiptCard';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const defaults = {
  topWeight: 225,
  topReps: 5,
  topIsAmrap: false,
  e1RMDisplay: 255,
  workingVolume: 3150,
  elapsedReady: false,
  elapsedValue: '',
  unitGlyph: 'lb' as const,
  bbbSetsCompleted: 0,
  bbbWeightDisplay: 0,
  prescribedReps: 5,
  missCardShown: false,
};

describe('ReceiptCard', () => {
  it('renders the section label', () => {
    const screen = wrap(<ReceiptCard {...defaults} />);
    expect(screen.getByText(/The record/i)).toBeTruthy();
  });

  it('renders the top set row with weight and reps', () => {
    const screen = wrap(<ReceiptCard {...defaults} />);
    expect(screen.getByTestId('receipt-top')).toBeTruthy();
    expect(screen.getByText('225 × 5')).toBeTruthy();
  });

  it('adds the "+" suffix for AMRAP sets', () => {
    const screen = wrap(<ReceiptCard {...defaults} topIsAmrap={true} />);
    expect(screen.getByText('225 × 5+')).toBeTruthy();
  });

  it('renders the e1RM row when topIsAmrap is true', () => {
    const screen = wrap(<ReceiptCard {...defaults} topIsAmrap={true} />);
    expect(screen.getByTestId('receipt-e1rm')).toBeTruthy();
    expect(screen.getByText('255')).toBeTruthy();
  });

  it('does not render e1RM row for non-AMRAP sets', () => {
    const screen = wrap(<ReceiptCard {...defaults} topIsAmrap={false} />);
    expect(screen.queryByTestId('receipt-e1rm')).toBeNull();
  });

  it('renders volume row', () => {
    const screen = wrap(<ReceiptCard {...defaults} />);
    expect(screen.getByTestId('receipt-volume')).toBeTruthy();
    expect(screen.getByText('3,150')).toBeTruthy();
  });

  it('renders BBB row when sets were completed', () => {
    const screen = wrap(<ReceiptCard {...defaults} bbbSetsCompleted={5} bbbWeightDisplay={115} />);
    expect(screen.getByTestId('receipt-bbb')).toBeTruthy();
    expect(screen.getByText('115')).toBeTruthy();
  });

  it('does not render BBB row when sets = 0', () => {
    const screen = wrap(<ReceiptCard {...defaults} bbbSetsCompleted={0} />);
    expect(screen.queryByTestId('receipt-bbb')).toBeNull();
  });

  it('renders elapsed row when elapsed is ready', () => {
    const screen = wrap(<ReceiptCard {...defaults} elapsedReady={true} elapsedValue="42:30" />);
    expect(screen.getByTestId('receipt-elapsed')).toBeTruthy();
    expect(screen.getByText('42:30')).toBeTruthy();
  });

  it('omits elapsed row when not ready', () => {
    const screen = wrap(<ReceiptCard {...defaults} elapsedReady={false} />);
    expect(screen.queryByTestId('receipt-elapsed')).toBeNull();
  });

  describe('"Matched target." note', () => {
    const matched = {
      ...defaults,
      topIsAmrap: true,
      topReps: 5,
      prescribedReps: 5,
      missCardShown: false,
    };

    it('shows the note when an AMRAP top set matched its target exactly', () => {
      const screen = wrap(<ReceiptCard {...matched} />);
      expect(screen.getByTestId('receipt-matched-target')).toBeTruthy();
      expect(screen.getByText('Matched target.')).toBeTruthy();
    });

    it('hides the note when the top set was not an AMRAP', () => {
      const screen = wrap(<ReceiptCard {...matched} topIsAmrap={false} />);
      expect(screen.queryByTestId('receipt-matched-target')).toBeNull();
    });

    it('hides the note when the AMRAP exceeded the target (surplus)', () => {
      const screen = wrap(<ReceiptCard {...matched} topReps={8} prescribedReps={5} />);
      expect(screen.queryByTestId('receipt-matched-target')).toBeNull();
    });

    it('hides the note when the AMRAP fell short of the target', () => {
      const screen = wrap(<ReceiptCard {...matched} topReps={3} prescribedReps={5} />);
      expect(screen.queryByTestId('receipt-matched-target')).toBeNull();
    });

    it('hides the note when the miss-correction card is shown', () => {
      const screen = wrap(<ReceiptCard {...matched} missCardShown={true} />);
      expect(screen.queryByTestId('receipt-matched-target')).toBeNull();
    });
  });
});
