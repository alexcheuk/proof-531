import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { ThemeProvider } from '../../theme';
import { Numerical } from '../Numerical';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('Numerical', () => {
  it('renders 135 lb as 1 × 45 per side', () => {
    const { getByText } = wrap(<Numerical weight={135} />);
    expect(getByText('1 × 45')).toBeTruthy();
  });

  it('renders 225 lb as 2 × 45 per side', () => {
    const { getByText } = wrap(<Numerical weight={225} />);
    expect(getByText('2 × 45')).toBeTruthy();
  });

  it('renders 315 lb as 3 × 45 per side', () => {
    const { getByText } = wrap(<Numerical weight={315} />);
    expect(getByText('3 × 45')).toBeTruthy();
  });

  it('renders 405 lb as 4 × 45 per side', () => {
    const { getByText } = wrap(<Numerical weight={405} />);
    expect(getByText('4 × 45')).toBeTruthy();
  });

  it('groups mixed plates (e.g. 285 lb → 2 × 45 + 1 × 25 + 1 × 5)', () => {
    const { getByText } = wrap(<Numerical weight={285} />);
    expect(getByText('2 × 45')).toBeTruthy();
    expect(getByText('1 × 25')).toBeTruthy();
    expect(getByText('1 × 5')).toBeTruthy();
  });

  it('renders bar-only when weight equals bar', () => {
    const { getByText } = wrap(<Numerical weight={45} />);
    expect(getByText(/Bar only/)).toBeTruthy();
  });

  it('renders the "Per side" caption', () => {
    const { getByText } = wrap(<Numerical weight={225} />);
    expect(getByText('Per side')).toBeTruthy();
  });

  it.each([135, 225, 315, 405, 495])('renders %d lb without crashing', (w) => {
    const { toJSON } = wrap(<Numerical weight={w} />);
    expect(toJSON()).toBeDefined();
  });

  it('renders a remainder hint when the inventory cannot reach the target', () => {
    const { getByText } = wrap(
      <Numerical
        weight={200}
        inventory={[
          { size: 45, count: 2 },
          { size: 10, count: 0 },
        ]}
      />,
    );
    expect(getByText(/Short by/)).toBeTruthy();
  });
});
