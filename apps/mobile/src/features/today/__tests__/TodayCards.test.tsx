import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type React from 'react';
import { TodayCards } from '../TodayCards';
import type { TodaySession } from '../today-types';

jest.mock('@shopify/react-native-skia', () => {
  const ReactMock = require('react');
  const passthrough = ({ children }: { children?: unknown }) =>
    ReactMock.createElement(ReactMock.Fragment, null, children);
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

const session: TodaySession = {
  cycleNumber: 3,
  liftId: 'squat',
  liftLabel: 'Squat',
  trainingMax: 300,
  unit: 'lbs',
  weekOfCycle: 1,
  sets: [
    { index: 0, type: 'main', weight: 195, reps: 5, amrap: false, pct: 0.65, done: true },
    { index: 1, type: 'main', weight: 225, reps: 5, amrap: false, pct: 0.75, done: false },
    { index: 2, type: 'main', weight: 250, reps: 5, amrap: true, pct: 0.85, done: false },
  ],
};

describe('TodayCards', () => {
  it('renders three SetCards keyed by state', () => {
    const { getByTestId, getAllByTestId } = wrap(<TodayCards session={session} />);
    expect(getByTestId('today-cards')).toBeTruthy();
    expect(getByTestId('set-card-done-0')).toBeTruthy();
    expect(getByTestId('set-card-next')).toBeTruthy();
    expect(getByTestId('set-card-2')).toBeTruthy();
    expect(getAllByTestId(/^set-card-/)).toHaveLength(3);
  });

  it('pressing the next card calls onStartSet with that index', () => {
    const onStartSet = jest.fn();
    const { getByTestId } = wrap(<TodayCards session={session} onStartSet={onStartSet} />);
    fireEvent.press(getByTestId('set-card-next'));
    expect(onStartSet).toHaveBeenCalledWith(1);
  });

  it('done card row is rendered with reduced opacity', () => {
    const { getByTestId } = wrap(<TodayCards session={session} />);
    const doneCard = getByTestId('set-card-done-0');
    // The opacity is applied to the inner row View (first child of the Card).
    // We walk into the rendered tree to find any node with opacity: 0.6.
    const flatten = (node: unknown): unknown[] => {
      // biome-ignore lint/suspicious/noExplicitAny: test-only traversal
      const n = node as any;
      if (!n || typeof n !== 'object') return [];
      const acc: unknown[] = [n];
      const kids = Array.isArray(n.children) ? n.children : [];
      for (const k of kids) acc.push(...flatten(k));
      return acc;
    };
    const nodes = flatten(doneCard);
    const hasDimmed = nodes.some((n) => {
      // biome-ignore lint/suspicious/noExplicitAny: test-only traversal
      const props = (n as any)?.props;
      const style = props?.style;
      const styles = Array.isArray(style) ? style : [style];
      return styles.some((s) => s && typeof s === 'object' && s.opacity === 0.6);
    });
    expect(hasDimmed).toBe(true);
  });

  it('non-next future card is not pressable', () => {
    const onStartSet = jest.fn();
    const { getByTestId } = wrap(<TodayCards session={session} onStartSet={onStartSet} />);
    fireEvent.press(getByTestId('set-card-2'));
    expect(onStartSet).not.toHaveBeenCalled();
  });
});
