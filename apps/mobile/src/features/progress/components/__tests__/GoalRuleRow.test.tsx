import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import { GoalRuleRow } from '../GoalRuleRow';

const renderRow = (props: Parameters<typeof GoalRuleRow>[0]) =>
  render(
    <ThemeProvider>
      <GoalRuleRow {...props} />
    </ThemeProvider>,
  );

describe('GoalRuleRow', () => {
  it('renders the goal value and unit for kind=tm', () => {
    const screen = renderRow({
      kind: 'tm',
      value: 315,
      targetTm: 315,
      unitGlyph: 'lb',
    });
    expect(screen.getByText('Goal · training max 315lb')).toBeTruthy();
  });

  it('renders the goal value and unit for kind=1rm', () => {
    const screen = renderRow({
      kind: '1rm',
      value: 350,
      targetTm: 315,
      unitGlyph: 'lb',
    });
    expect(screen.getByText('Goal · 1rm 350lb')).toBeTruthy();
    // Shows the TM equivalent on the right for 1rm goals
    expect(screen.getByText('tm ≈ 315lb')).toBeTruthy();
  });

  it('does not show tm equivalent for kind=tm', () => {
    const screen = renderRow({
      kind: 'tm',
      value: 315,
      targetTm: 315,
      unitGlyph: 'lb',
    });
    expect(screen.queryByText(/tm ≈/)).toBeNull();
  });

  it('renders the testID on the container', () => {
    const screen = renderRow({
      kind: 'tm',
      value: 200,
      targetTm: 200,
      unitGlyph: 'kg',
      testID: 'goal-rule',
    });
    expect(screen.getByTestId('goal-rule')).toBeTruthy();
  });

  it('has an accessibilityLabel describing the goal line', () => {
    const screen = renderRow({
      kind: 'tm',
      value: 200,
      targetTm: 200,
      unitGlyph: 'lb',
    });
    expect(screen.getByLabelText('Goal line, 200 lb')).toBeTruthy();
  });
});
