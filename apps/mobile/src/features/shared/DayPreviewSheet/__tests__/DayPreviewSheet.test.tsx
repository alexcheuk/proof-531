/**
 * Behavioral tests for the read-only DayPreviewSheet.
 *
 * Asserts the sheet composes the right bands per week, renders the week-4
 * TM-test branch, surfaces logged reps for a completed-past day, and exposes
 * NO Begin/mutation affordance (the read-only guarantee).
 */
import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

const mockSetLogs: { data: unknown; isLoading: boolean; isError: boolean } = {
  data: [],
  isLoading: false,
  isError: false,
};
const mockSessions: { data: unknown } = { data: [] };

jest.mock('@/data/queries/useSetLogsForSession', () => ({
  useSetLogsForSession: () => mockSetLogs,
  SET_LOGS_FOR_SESSION_KEY: (id: number | null) => ['setLogsForSession', id],
}));
jest.mock('@/data/queries/useSessions', () => ({
  useSessions: () => mockSessions,
  SESSIONS_KEY: ['sessions'],
}));

// @gorhom/bottom-sheet stub — Reanimated worklets don't run in Jest. Render
// children directly so we can assert on the composed body.
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

import { DayPreviewSheet } from '../DayPreviewSheet';

const renderSheet = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const baseProps = {
  open: true as const,
  lift: 'bench' as const,
  cycle: 3,
  storageUnit: 'lbs' as const,
  tm: 200,
  plateSet: 'standard' as const,
  onDismiss: jest.fn(),
};

beforeEach(() => {
  mockSetLogs.data = [];
  mockSetLogs.isLoading = false;
  mockSetLogs.isError = false;
  mockSessions.data = [];
});

describe('DayPreviewSheet', () => {
  it('renders the compact header with lift, cycle, week and scheme', () => {
    const screen = renderSheet(<DayPreviewSheet {...baseProps} week={2} sessionId={null} />);
    expect(screen.getByText('BENCH · C3 · W2 · 3/3/3+')).toBeTruthy();
  });

  it('renders the prescription bands (hero, warmups, working sets, BBB) on a weeks-1-3 day', () => {
    const screen = renderSheet(<DayPreviewSheet {...baseProps} week={2} sessionId={null} />);
    expect(screen.getByTestId('today-top-set')).toBeTruthy();
    expect(screen.getByTestId('warmups-toggle')).toBeTruthy();
    expect(screen.getByTestId('set-row-0')).toBeTruthy();
    expect(screen.getByTestId('set-row-2')).toBeTruthy();
    expect(screen.getByTestId('today-bbb-band')).toBeTruthy();
  });

  it('renders TmTestNote (not working sets + BBB) on week 4', () => {
    const screen = renderSheet(<DayPreviewSheet {...baseProps} week={4} sessionId={null} />);
    expect(screen.getByTestId('today-tm-test-note')).toBeTruthy();
    expect(screen.queryByTestId('set-row-0')).toBeNull();
    expect(screen.queryByTestId('today-bbb-band')).toBeNull();
  });

  it('shows no LOGGED block in prescription-only mode (sessionId null)', () => {
    const screen = renderSheet(<DayPreviewSheet {...baseProps} week={2} sessionId={null} />);
    expect(screen.queryByTestId('day-preview-logged')).toBeNull();
    expect(screen.queryByTestId('day-preview-logged-caption')).toBeNull();
  });

  it('shows the logged-reps mini-receipt for a completed past day', () => {
    mockSetLogs.data = [
      { id: 1, index: 0, kind: 'working', prescribedWeight: 130, prescribedReps: 3, actualReps: 3 },
      { id: 2, index: 1, kind: 'working', prescribedWeight: 150, prescribedReps: 3, actualReps: 3 },
      { id: 3, index: 2, kind: 'amrap', prescribedWeight: 170, prescribedReps: 3, actualReps: 8 },
    ];
    mockSessions.data = [{ id: 42, startedAt: Date.now(), lift: 'bench', status: 'completed' }];
    const screen = renderSheet(<DayPreviewSheet {...baseProps} week={2} sessionId={42} />);
    expect(screen.getByTestId('day-preview-logged')).toBeTruthy();
    // AMRAP set reads with a trailing "+".
    expect(screen.getByText('8+ reps @ 170 lb')).toBeTruthy();
    expect(screen.getByText('3 reps @ 130 lb')).toBeTruthy();
  });

  it('shows a LOGGED caption on a completed past day', () => {
    mockSessions.data = [{ id: 42, startedAt: Date.now(), lift: 'bench', status: 'completed' }];
    const screen = renderSheet(<DayPreviewSheet {...baseProps} week={2} sessionId={42} />);
    expect(screen.getByTestId('day-preview-logged-caption')).toBeTruthy();
  });

  it('falls back to NO LOGGED SETS when a completed day returns no logs', () => {
    mockSetLogs.data = [];
    const screen = renderSheet(<DayPreviewSheet {...baseProps} week={2} sessionId={42} />);
    expect(screen.getByTestId('day-preview-logged-empty')).toBeTruthy();
  });

  it('shows the loading placeholder while logs resolve on a completed day', () => {
    mockSetLogs.isLoading = true;
    const screen = renderSheet(<DayPreviewSheet {...baseProps} week={2} sessionId={42} />);
    expect(screen.getByTestId('day-preview-logged-loading')).toBeTruthy();
    // Prescription is never gated on the log query.
    expect(screen.getByTestId('set-row-0')).toBeTruthy();
  });

  it('shows the showing-plan caption when the log query errors', () => {
    mockSetLogs.isError = true;
    const screen = renderSheet(<DayPreviewSheet {...baseProps} week={2} sessionId={42} />);
    expect(screen.getByTestId('day-preview-logged-error')).toBeTruthy();
    expect(screen.getByTestId('set-row-0')).toBeTruthy();
  });

  it('exposes no Begin/Resume/mutation control (read-only guarantee)', () => {
    const screen = renderSheet(<DayPreviewSheet {...baseProps} week={2} sessionId={null} />);
    expect(screen.queryByText('Begin session')).toBeNull();
    expect(screen.queryByText(/resume/i)).toBeNull();
    expect(screen.queryByText(/begin/i)).toBeNull();
  });
});
