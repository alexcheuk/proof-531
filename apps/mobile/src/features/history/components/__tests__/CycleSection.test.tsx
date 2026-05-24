import type { Session } from '@/data/accessors/session';
import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn().mockResolvedValue(undefined),
}));

import { CycleSection } from '../CycleSection';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

function makeSession(over: Partial<Session> = {}): Session {
  const base = new Date(2026, 4, 1, 12).getTime();
  return {
    id: 1,
    lift: 'squat',
    cycle: 2,
    week: 1,
    startedAt: base,
    endedAt: base + 60_000,
    status: 'completed',
    trainingMaxSnapshot: 315,
    storageUnitSnapshot: 'lbs',
    displayUnitSnapshot: 'lbs',
    ...over,
  };
}

describe('CycleSection', () => {
  it('renders the Cycle NN header (zero-padded)', () => {
    const screen = wrap(
      <CycleSection cycle={3} sessions={[makeSession()]} prSessionIds={new Set()} />,
    );
    expect(screen.getByText('Cycle 03')).toBeTruthy();
    expect(screen.getByTestId('history-cycle-3')).toBeTruthy();
  });

  it('renders the computed hint above the rows', () => {
    const screen = wrap(
      <CycleSection
        cycle={1}
        sessions={[
          makeSession({ id: 1, status: 'completed' }),
          makeSession({ id: 2, status: 'in_progress' }),
        ]}
        prSessionIds={new Set()}
      />,
    );
    expect(screen.getByText('1 of 2 done')).toBeTruthy();
  });

  it('renders one SessionListRow per session in order', () => {
    const screen = wrap(
      <CycleSection
        cycle={2}
        sessions={[makeSession({ id: 10 }), makeSession({ id: 11 }), makeSession({ id: 12 })]}
        prSessionIds={new Set()}
      />,
    );
    expect(screen.getByTestId('history-row-10')).toBeTruthy();
    expect(screen.getByTestId('history-row-11')).toBeTruthy();
    expect(screen.getByTestId('history-row-12')).toBeTruthy();
  });

  it('renders the PR chip on rows that match prSessionIds', () => {
    const screen = wrap(
      <CycleSection
        cycle={2}
        sessions={[makeSession({ id: 20 }), makeSession({ id: 21 })]}
        prSessionIds={new Set([21])}
      />,
    );
    expect(screen.queryByTestId('history-row-20-pr')).toBeNull();
    expect(screen.getByTestId('history-row-21-pr')).toBeTruthy();
  });

  it('forwards onPressPr to the PR chip on each row', () => {
    const onPressPr = jest.fn();
    const screen = wrap(
      <CycleSection
        cycle={2}
        sessions={[makeSession({ id: 30, lift: 'bench' })]}
        prSessionIds={new Set([30])}
        onPressPr={onPressPr}
      />,
    );
    fireEvent.press(screen.getByTestId('history-row-30-pr'));
    expect(onPressPr).toHaveBeenCalledWith('bench');
  });
});
