import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import type { BestLift } from '../bestLift';
import { AchievementStrip } from '../components/AchievementStrip';

const renderStrip = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const ACTIVITY = [false, false, true, true, true]; // current streak = 3

describe('AchievementStrip', () => {
  it('renders nothing when filed = 0', () => {
    const { queryByTestId } = renderStrip(
      <AchievementStrip filed={0} prs={0} activity={ACTIVITY} />,
    );
    expect(queryByTestId('history-achievements')).toBeNull();
  });

  it('renders both stat values when filed > 0', () => {
    const { getByText, getByTestId } = renderStrip(
      <AchievementStrip filed={4} prs={1} activity={ACTIVITY} />,
    );
    expect(getByText('sessions filed')).toBeTruthy();
    expect(getByText('personal record')).toBeTruthy();
    expect(getByTestId('history-achievements-prs').props.children).toBe(1);
  });

  it('pluralises labels correctly when count = 1', () => {
    const { getByText } = renderStrip(<AchievementStrip filed={1} prs={1} activity={ACTIVITY} />);
    expect(getByText('session filed')).toBeTruthy();
    expect(getByText('personal record')).toBeTruthy();
  });

  it('shows the best-lift chip when bestLift prop is provided', () => {
    const best: BestLift = { lift: 'bench', e1RMDisplay: 215, unitGlyph: 'lb' };
    const { getByTestId } = renderStrip(
      <AchievementStrip filed={3} prs={1} activity={ACTIVITY} bestLift={best} />,
    );
    const chip = getByTestId('history-best-lift');
    expect(chip).toBeTruthy();
    // The chip text contains the lift display name + value + unit.
    expect(chip.props.children).toContain('Bench');
    expect(chip.props.children).toContain('215');
    expect(chip.props.children).toContain('lb');
  });

  it('hides the best-lift chip when bestLift is null', () => {
    const { queryByTestId } = renderStrip(
      <AchievementStrip filed={3} prs={0} activity={ACTIVITY} bestLift={null} />,
    );
    expect(queryByTestId('history-best-lift')).toBeNull();
  });

  it('renders the activity sparkline as a child', () => {
    const { getByTestId } = renderStrip(<AchievementStrip filed={2} prs={0} activity={ACTIVITY} />);
    expect(getByTestId('history-activity-sparkline')).toBeTruthy();
  });

  it('shows the longest-streak chip when ≥ 3', () => {
    const { getByTestId } = renderStrip(
      <AchievementStrip filed={5} prs={1} activity={ACTIVITY} longestStreak={7} />,
    );
    const chip = getByTestId('history-longest-streak');
    expect(chip).toBeTruthy();
    expect(chip.props.children).toContain('Best streak');
    expect(chip.props.children).toContain('7 days');
  });

  it('hides the longest-streak chip when < 3', () => {
    const { queryByTestId } = renderStrip(
      <AchievementStrip filed={5} prs={1} activity={ACTIVITY} longestStreak={2} />,
    );
    expect(queryByTestId('history-longest-streak')).toBeNull();
  });

  it('hides the longest-streak chip when prop is omitted', () => {
    const { queryByTestId } = renderStrip(
      <AchievementStrip filed={5} prs={0} activity={ACTIVITY} />,
    );
    expect(queryByTestId('history-longest-streak')).toBeNull();
  });

  it('tags the Best streak chip with "MATCHING NOW" when current === longest', () => {
    const { getByTestId } = renderStrip(
      <AchievementStrip
        filed={5}
        prs={1}
        activity={ACTIVITY}
        longestStreak={5}
        currentStreak={5}
      />,
    );
    const chip = getByTestId('history-longest-streak');
    expect(chip.props.children).toContain('MATCHING NOW');
    expect(chip.props.children).toContain('5 days');
  });

  it('omits the MATCHING NOW tag when current < longest', () => {
    const { getByTestId } = renderStrip(
      <AchievementStrip
        filed={5}
        prs={1}
        activity={ACTIVITY}
        longestStreak={7}
        currentStreak={2}
      />,
    );
    const chip = getByTestId('history-longest-streak');
    expect(chip.props.children).not.toContain('MATCHING NOW');
  });

  it('renders the lifetime-volume stat cell when lifetimeVolume > 0', () => {
    const { getByTestId, getByText } = renderStrip(
      <AchievementStrip filed={3} prs={1} activity={ACTIVITY} lifetimeVolume={12_400} unit="lbs" />,
    );
    const cell = getByTestId('history-achievements-volume');
    expect(cell).toBeTruthy();
    expect(cell.props.children).toBe('12.4k lb');
    expect(getByText('total volume')).toBeTruthy();
  });

  it('uses the kg glyph when unit is kg', () => {
    const { getByTestId } = renderStrip(
      <AchievementStrip filed={3} prs={1} activity={ACTIVITY} lifetimeVolume={8400} unit="kg" />,
    );
    expect(getByTestId('history-achievements-volume').props.children).toBe('8,400 kg');
  });

  it('hides the lifetime-volume stat when value is 0 or omitted', () => {
    const noVol = renderStrip(
      <AchievementStrip filed={3} prs={1} activity={ACTIVITY} lifetimeVolume={0} unit="lbs" />,
    );
    expect(noVol.queryByTestId('history-achievements-volume')).toBeNull();
    const omitted = renderStrip(<AchievementStrip filed={3} prs={1} activity={ACTIVITY} />);
    expect(omitted.queryByTestId('history-achievements-volume')).toBeNull();
  });
});
