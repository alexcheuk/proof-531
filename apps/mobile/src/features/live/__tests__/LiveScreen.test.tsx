import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type React from 'react';
import { LiveScreen, type TodaySession } from '../LiveScreen';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const passthrough = ({ children }: { children?: unknown }) =>
    React.createElement(React.Fragment, null, children);
  return {
    Canvas: passthrough,
    Group: passthrough,
    Rect: passthrough,
    RoundedRect: () => null,
    Path: () => null,
    LinearGradient: () => null,
    vec: (x: number, y: number) => ({ x, y }),
    Skia: { Path: { Make: () => ({ addCircle() {}, addArc() {} }) } },
  };
});

const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const mainSession: TodaySession = {
  liftId: 'squat',
  liftLabel: 'Squat',
  unit: 'lbs',
  sets: [
    { index: 0, type: 'main', prescribedWeight: 195, prescribedReps: 5, amrap: false },
    { index: 1, type: 'main', prescribedWeight: 225, prescribedReps: 3, amrap: false },
  ],
};

const amrapSession: TodaySession = {
  liftId: 'bench',
  liftLabel: 'Bench',
  unit: 'lbs',
  sets: [{ index: 0, type: 'main', prescribedWeight: 200, prescribedReps: 5, amrap: true }],
};

describe('LiveScreen', () => {
  it('renders LiftingPhase with prescribed weight and Complete button initially', () => {
    const { getByText, getByTestId } = wrap(
      <LiveScreen session={mainSession} setIndex={0} onComplete={() => {}} onClose={() => {}} />,
    );
    expect(getByTestId('lifting-phase')).toBeTruthy();
    expect(getByText('195')).toBeTruthy();
    expect(getByText('Complete')).toBeTruthy();
  });

  it('pressing Complete invokes onComplete with prescribed reps by default', () => {
    const onComplete = jest.fn();
    const { getByText } = wrap(
      <LiveScreen session={mainSession} setIndex={0} onComplete={onComplete} onClose={() => {}} />,
    );
    fireEvent.press(getByText('Complete'));
    expect(onComplete).toHaveBeenCalledWith({ index: 0, actualReps: 5 });
  });

  it('transitions to RestPhase after Complete', () => {
    const { getByText, getByTestId, queryByTestId } = wrap(
      <LiveScreen session={mainSession} setIndex={0} onComplete={() => {}} onClose={() => {}} />,
    );
    fireEvent.press(getByText('Complete'));
    expect(getByTestId('rest-phase')).toBeTruthy();
    expect(queryByTestId('lifting-phase')).toBeNull();
    // Timer initially reads 0:00.
    expect(getByText('0:00')).toBeTruthy();
  });

  it('AMRAP: bumping reps via stepper then completing fires onPRDetected with e1RM', () => {
    const onPRDetected = jest.fn();
    const { getAllByLabelText, getByText } = wrap(
      <LiveScreen
        session={amrapSession}
        setIndex={0}
        history={[]}
        onComplete={() => {}}
        onClose={() => {}}
        onPRDetected={onPRDetected}
      />,
    );
    // Bump from 5 -> 8 reps. There's exactly one Increment button on screen
    // (NumberStepper's `+`).
    const [increment] = getAllByLabelText('Increment');
    if (!increment) throw new Error('Increment button not found');
    fireEvent.press(increment);
    fireEvent.press(increment);
    fireEvent.press(increment);
    fireEvent.press(getByText('Complete'));
    // epley(200, 8) = round(200 * (1 + 8/30)) = round(253.33...) = 253
    expect(onPRDetected).toHaveBeenCalledWith({ liftId: 'bench', newE1RM: 253 });
  });

  it('AMRAP: does not fire onPRDetected when history max beats computed e1RM', () => {
    const onPRDetected = jest.fn();
    const { getByText } = wrap(
      <LiveScreen
        session={amrapSession}
        setIndex={0}
        history={[999]}
        onComplete={() => {}}
        onClose={() => {}}
        onPRDetected={onPRDetected}
      />,
    );
    fireEvent.press(getByText('Complete'));
    expect(onPRDetected).not.toHaveBeenCalled();
  });

  it('non-AMRAP set never fires onPRDetected even with empty history', () => {
    const onPRDetected = jest.fn();
    const { getByText } = wrap(
      <LiveScreen
        session={mainSession}
        setIndex={0}
        history={[]}
        onComplete={() => {}}
        onClose={() => {}}
        onPRDetected={onPRDetected}
      />,
    );
    fireEvent.press(getByText('Complete'));
    expect(onPRDetected).not.toHaveBeenCalled();
  });
});
