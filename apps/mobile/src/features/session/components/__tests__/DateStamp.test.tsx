import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { DateStamp } from '../DateStamp';

const renderStamp = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('DateStamp', () => {
  it('renders the weekday + dateLine + year + default top label', () => {
    const screen = renderStamp(
      <DateStamp weekday="WED" dateLine="MAY 22" year="2026" testID="stamp" />,
    );
    expect(screen.getByTestId('stamp')).toBeTruthy();
    expect(screen.getByText('WED')).toBeTruthy();
    expect(screen.getByText('MAY 22')).toBeTruthy();
    expect(screen.getByText('★  2026  ★')).toBeTruthy();
    expect(screen.getByText('531 · ENTERED')).toBeTruthy();
  });

  it('substitutes the top label when topArcLabel is provided (PR case)', () => {
    const screen = renderStamp(
      <DateStamp weekday="FRI" dateLine="MAY 24" year="2026" topArcLabel="★  NEW RECORD  ★" />,
    );
    expect(screen.getByText('★  NEW RECORD  ★')).toBeTruthy();
    expect(screen.queryByText('531 · ENTERED')).toBeNull();
  });

  it('omits the centred date line when dateLine is empty', () => {
    const screen = renderStamp(<DateStamp weekday="TODAY" dateLine="" year="2026" />);
    expect(screen.getByText('TODAY')).toBeTruthy();
    expect(screen.queryByText('MAY 22')).toBeNull();
  });

  it('exposes a testID-prefixed top label when testID is provided', () => {
    const screen = renderStamp(
      <DateStamp weekday="WED" dateLine="MAY 22" year="2026" testID="stamp" />,
    );
    expect(screen.getByTestId('stamp-top')).toBeTruthy();
  });
});
