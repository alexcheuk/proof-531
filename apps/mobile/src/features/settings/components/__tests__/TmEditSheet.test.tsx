import { ThemeProvider } from '@/design/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

const mockSetTrainingMax = jest.fn().mockResolvedValue(undefined);
jest.mock('@/data/accessors/trainingMax', () => ({
  setTrainingMax: (...args: unknown[]) => mockSetTrainingMax(...args),
}));
jest.mock('@/data/DbProvider', () => ({
  useDb: () => ({ __stub: 'db' }),
}));

jest.mock('@gorhom/bottom-sheet', () => {
  const React = jest.requireActual('react');
  return {
    __esModule: true,
    // biome-ignore lint/suspicious/noExplicitAny: test stub
    default: ({ children }: any) => React.createElement(React.Fragment, null, children),
    BottomSheetBackdrop: () => null,
    // biome-ignore lint/suspicious/noExplicitAny: test stub
    BottomSheetView: ({ children }: any) => React.createElement(React.Fragment, null, children),
  };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

import { TmEditSheet } from '../TmEditSheet';

function wrap(ui: ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ThemeProvider>{ui}</ThemeProvider>
    </QueryClientProvider>,
  );
}

describe('TmEditSheet', () => {
  beforeEach(() => mockSetTrainingMax.mockClear());

  it('renders the Edit training max eyebrow + lift label', () => {
    const screen = wrap(
      <TmEditSheet
        lift="squat"
        currentValue={315}
        storageUnit="lbs"
        displayUnit="lbs"
        onClose={() => {}}
      />,
    );
    expect(screen.getByText('Edit training max')).toBeTruthy();
    expect(screen.getByText('Back squat')).toBeTruthy();
    expect(screen.getByTestId('tm-edit-stepper')).toBeTruthy();
  });

  it('renders "No change from current" when draft equals currentValue', () => {
    const screen = wrap(
      <TmEditSheet
        lift="bench"
        currentValue={225}
        storageUnit="lbs"
        displayUnit="lbs"
        onClose={() => {}}
      />,
    );
    expect(screen.getByTestId('tm-edit-delta').props.children).toBe('No change from current');
  });

  it('appends a percent-delta clause when the user bumps the stepper', () => {
    const screen = wrap(
      <TmEditSheet
        lift="bench"
        currentValue={200}
        storageUnit="lbs"
        displayUnit="lbs"
        onClose={() => {}}
      />,
    );
    // +5 lb on a 200 lb TM = +2.5%.
    fireEvent.press(screen.getByTestId('tm-edit-stepper-plus'));
    expect(screen.getByTestId('tm-edit-delta').props.children).toBe('+5 lb · +2.5% from current');
  });

  it('drops the decimal on percent jumps ≥ 10%', () => {
    const screen = wrap(
      <TmEditSheet
        lift="press"
        currentValue={100}
        storageUnit="lbs"
        displayUnit="lbs"
        onClose={() => {}}
      />,
    );
    // Press +5 three times = +15 lb on 100 lb TM = +15%, rounds to "+15%".
    fireEvent.press(screen.getByTestId('tm-edit-stepper-plus'));
    fireEvent.press(screen.getByTestId('tm-edit-stepper-plus'));
    fireEvent.press(screen.getByTestId('tm-edit-stepper-plus'));
    expect(screen.getByTestId('tm-edit-delta').props.children).toBe('+15 lb · +15% from current');
  });

  it('hides the BIG JUMP nudge when delta is within 2× the per-cycle bump', () => {
    const screen = wrap(
      <TmEditSheet
        lift="bench"
        currentValue={200}
        storageUnit="lbs"
        displayUnit="lbs"
        onClose={() => {}}
      />,
    );
    // Bench (upper) recommended +5 lb / cycle → 2× = +10 lb. +5 stays clean.
    fireEvent.press(screen.getByTestId('tm-edit-stepper-plus'));
    expect(screen.queryByTestId('tm-edit-big-jump')).toBeNull();
  });

  it('surfaces the BIG JUMP nudge once the upper-body delta exceeds 2× the program bump', () => {
    const screen = wrap(
      <TmEditSheet
        lift="bench"
        currentValue={200}
        storageUnit="lbs"
        displayUnit="lbs"
        onClose={() => {}}
      />,
    );
    // Bench: +5 lb × 3 = +15 lb > 2× recommended (10 lb). BIG JUMP fires.
    fireEvent.press(screen.getByTestId('tm-edit-stepper-plus'));
    fireEvent.press(screen.getByTestId('tm-edit-stepper-plus'));
    fireEvent.press(screen.getByTestId('tm-edit-stepper-plus'));
    const hint = screen.getByTestId('tm-edit-big-jump');
    expect(hint.props.children).toContain('Big jump');
    expect(hint.props.children).toContain('5 lb per cycle');
  });

  it('uses the lower-body bump for squat / deadlift in the BIG JUMP comparison', () => {
    const screen = wrap(
      <TmEditSheet
        lift="squat"
        currentValue={300}
        storageUnit="lbs"
        displayUnit="lbs"
        onClose={() => {}}
      />,
    );
    // Squat (lower) recommended +10 lb / cycle → 2× = +20 lb.
    // +5 lb × 4 = +20 lb: not over the threshold yet (strict `>`).
    fireEvent.press(screen.getByTestId('tm-edit-stepper-plus'));
    fireEvent.press(screen.getByTestId('tm-edit-stepper-plus'));
    fireEvent.press(screen.getByTestId('tm-edit-stepper-plus'));
    fireEvent.press(screen.getByTestId('tm-edit-stepper-plus'));
    expect(screen.queryByTestId('tm-edit-big-jump')).toBeNull();
    // One more bump (+25) crosses the line.
    fireEvent.press(screen.getByTestId('tm-edit-stepper-plus'));
    const hint = screen.getByTestId('tm-edit-big-jump');
    expect(hint.props.children).toContain('10 lb per cycle');
  });

  it('hides the storage ≠ display caption when both units match', () => {
    const screen = wrap(
      <TmEditSheet
        lift="press"
        currentValue={135}
        storageUnit="lbs"
        displayUnit="lbs"
        onClose={() => {}}
      />,
    );
    expect(screen.queryByText(/editing in/)).toBeNull();
  });

  it('renders the storage ≠ display caption when units diverge', () => {
    const screen = wrap(
      <TmEditSheet
        lift="press"
        currentValue={135}
        storageUnit="lbs"
        displayUnit="kg"
        onClose={() => {}}
      />,
    );
    expect(screen.getByText('editing in lb · displayed as kg')).toBeTruthy();
  });

  it('blocks Save when the draft drops below the bar (legacy below-bar TM)', () => {
    const screen = wrap(
      <TmEditSheet
        lift="press"
        currentValue={30}
        storageUnit="lbs"
        displayUnit="lbs"
        onClose={() => {}}
      />,
    );
    // currentValue < bar (45 lb) — the editor opens on a below-bar draft and
    // refuses to save. The delta strip explains why.
    expect(screen.getByTestId('tm-edit-delta').props.children).toBe(
      "Training max can't go below the bar (45 lb)",
    );
    fireEvent.press(screen.getByTestId('tm-edit-save'));
    expect(mockSetTrainingMax).not.toHaveBeenCalled();
  });

  it('uses the kg bar (20) as the floor when storage is kg', () => {
    const screen = wrap(
      <TmEditSheet
        lift="press"
        currentValue={15}
        storageUnit="kg"
        displayUnit="kg"
        onClose={() => {}}
      />,
    );
    expect(screen.getByTestId('tm-edit-delta').props.children).toBe(
      "Training max can't go below the bar (20 kg)",
    );
  });

  it('fires onClose when Cancel is pressed', () => {
    const onClose = jest.fn();
    const screen = wrap(
      <TmEditSheet
        lift="squat"
        currentValue={315}
        storageUnit="lbs"
        displayUnit="lbs"
        onClose={onClose}
      />,
    );
    fireEvent.press(screen.getByTestId('tm-edit-cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
