import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { RestTimerControls } from '../RestTimerControls';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

const renderControls = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('RestTimerControls', () => {
  it('renders nothing when no handlers are supplied', () => {
    const screen = renderControls(<RestTimerControls />);
    expect(screen.queryByTestId('rest-timer-controls')).toBeNull();
  });

  it('renders only the −30s chip when only onSubRest is set', () => {
    const screen = renderControls(<RestTimerControls onSubRest={() => {}} />);
    expect(screen.getByTestId('rest-timer-sub')).toBeTruthy();
    expect(screen.queryByTestId('rest-timer-add')).toBeNull();
    expect(screen.queryByTestId('rest-timer-skip')).toBeNull();
  });

  it('fires onAddRest when the +30s chip is pressed', () => {
    const onAddRest = jest.fn();
    const screen = renderControls(<RestTimerControls onAddRest={onAddRest} />);
    fireEvent.press(screen.getByTestId('rest-timer-add'));
    expect(onAddRest).toHaveBeenCalledTimes(1);
  });

  it('fires onSkip when the Skip chip is pressed', () => {
    const onSkip = jest.fn();
    const screen = renderControls(<RestTimerControls onSkip={onSkip} />);
    fireEvent.press(screen.getByTestId('rest-timer-skip'));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('renders all three chips when all handlers are supplied', () => {
    const screen = renderControls(
      <RestTimerControls onAddRest={() => {}} onSubRest={() => {}} onSkip={() => {}} />,
    );
    expect(screen.getByText('−30s')).toBeTruthy();
    expect(screen.getByText('+30s')).toBeTruthy();
    expect(screen.getByText('Skip ›')).toBeTruthy();
  });
});
