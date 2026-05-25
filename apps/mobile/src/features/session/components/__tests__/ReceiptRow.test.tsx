import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { ReceiptRow } from '../ReceiptRow';

const renderRow = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ReceiptRow', () => {
  it('renders label, value, and sub clusters', () => {
    const screen = renderRow(
      <ReceiptRow label="Top set" value="225 × 8+" sub="lb · 85% tm" testID="row" />,
    );
    expect(screen.getByText('Top set')).toBeTruthy();
    expect(screen.getByText('225 × 8+')).toBeTruthy();
    expect(screen.getByText('lb · 85% tm')).toBeTruthy();
  });

  it('renders the optional stamp chip when provided', () => {
    const screen = renderRow(
      <ReceiptRow label="Top set" value="225 × 8+" sub="lb" stamp="★ PR" testID="row" />,
    );
    expect(screen.getByText('★ PR')).toBeTruthy();
  });

  it('omits the stamp chip when stamp is null', () => {
    const screen = renderRow(
      <ReceiptRow label="Top set" value="225 × 5" sub="lb" stamp={null} testID="row" />,
    );
    expect(screen.queryByText('★ PR')).toBeNull();
  });

  it('drops the top hairline border on the first row', () => {
    const screen = renderRow(
      <ReceiptRow label="Top set" value="225" sub="lb" first testID="first-row" />,
    );
    const row = screen.getByTestId('first-row');
    const style = Array.isArray(row.props.style)
      ? Object.assign({}, ...row.props.style.filter(Boolean))
      : row.props.style;
    expect(style.borderTopWidth).toBe(0);
  });

  it('keeps the top hairline border on non-first rows (default)', () => {
    const screen = renderRow(
      <ReceiptRow label="Volume" value="1500" sub="lb total" testID="row" />,
    );
    const row = screen.getByTestId('row');
    const style = Array.isArray(row.props.style)
      ? Object.assign({}, ...row.props.style.filter(Boolean))
      : row.props.style;
    expect(style.borderTopWidth).toBe(1);
  });

  it('composes an accessibility label so screen readers read the row as one (loop-014)', () => {
    const screen = renderRow(
      <ReceiptRow label="Top set" value="225 × 8+" sub="lb · 85% tm" stamp="★ PR" testID="row" />,
    );
    expect(
      screen.UNSAFE_root.findByProps({
        accessibilityLabel: 'Top set, 225 × 8+, lb · 85% tm, ★ PR',
      }),
    ).toBeTruthy();
  });
});
