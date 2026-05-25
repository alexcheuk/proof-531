import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import { GoalStrip } from './GoalStrip';

const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('GoalStrip', () => {
  it('renders the no-goal CTA copy and fires onPress', () => {
    const onPress = jest.fn();
    const { getByText, getByTestId } = wrap(
      <GoalStrip state="no-goal" onPress={onPress} testID="gs" />,
    );
    expect(getByText('SET AN e1RM GOAL')).toBeTruthy();
    expect(getByText('TAP TO PICK A TARGET')).toBeTruthy();
    fireEvent.press(getByTestId('gs'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders the goal-set copy with cycles-to-go', () => {
    const onPress = jest.fn();
    const { getByText } = wrap(
      <GoalStrip
        state="goal-set"
        goalValue={285}
        goalUnit="lb"
        cyclesUntilGoal={4}
        lift="squat"
        onPress={onPress}
      />,
    );
    expect(getByText('GOAL · e1RM 285 lb')).toBeTruthy();
    expect(getByText('~4 cycles to go')).toBeTruthy();
  });

  it('renders the "already past" sub-line when cyclesUntilGoal === 0', () => {
    const { getByText } = wrap(
      <GoalStrip
        state="goal-set"
        goalValue={200}
        goalUnit="lb"
        cyclesUntilGoal={0}
        lift="bench"
        onPress={jest.fn()}
      />,
    );
    expect(getByText('already past — pick a higher target')).toBeTruthy();
  });
});
