import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import { BeyondChartFooter } from '../BeyondChartFooter';

const renderFooter = (props: Parameters<typeof BeyondChartFooter>[0]) =>
  render(
    <ThemeProvider>
      <BeyondChartFooter {...props} />
    </ThemeProvider>,
  );

describe('BeyondChartFooter', () => {
  it('renders cycles-beyond label (plural)', () => {
    const screen = renderFooter({
      cyclesBeyond: 5,
      goalValue: 315,
      unitGlyph: 'lb',
    });
    expect(screen.getByText('↓ Goal · 5 cycles beyond chart')).toBeTruthy();
  });

  it('renders cycles-beyond label (singular)', () => {
    const screen = renderFooter({
      cyclesBeyond: 1,
      goalValue: 280,
      unitGlyph: 'lb',
    });
    expect(screen.getByText('↓ Goal · 1 cycle beyond chart')).toBeTruthy();
  });

  it('renders the goal value with unit', () => {
    const screen = renderFooter({
      cyclesBeyond: 3,
      goalValue: 120,
      unitGlyph: 'kg',
    });
    expect(screen.getByText('120kg')).toBeTruthy();
  });

  it('renders the testID', () => {
    const screen = renderFooter({
      cyclesBeyond: 2,
      goalValue: 200,
      unitGlyph: 'lb',
      testID: 'beyond-footer',
    });
    expect(screen.getByTestId('beyond-footer')).toBeTruthy();
  });
});
