import { ThemeProvider } from '@/design/theme';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';

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

import { RestoreBackupSheet, type RestoreResult } from '../RestoreBackupSheet';

const renderSheet = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('RestoreBackupSheet', () => {
  it('renders the RESTORE eyebrow, headline, and warning copy', () => {
    const screen = renderSheet(
      <RestoreBackupSheet open onCancel={() => {}} onConfirm={async () => ({ ok: true })} />,
    );
    expect(screen.getByText('RESTORE')).toBeTruthy();
    expect(screen.getByText('Restore from backup?')).toBeTruthy();
    expect(screen.getByText(/This replaces ALL your current data/)).toBeTruthy();
  });

  it('disables the primary CTA until text is pasted', () => {
    const onConfirm = jest.fn(async (): Promise<RestoreResult> => ({ ok: true }));
    const screen = renderSheet(
      <RestoreBackupSheet open onCancel={() => {}} onConfirm={onConfirm} />,
    );
    // Empty paste field → pressing the primary is a no-op.
    fireEvent.press(screen.getByTestId('restore-confirm'));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm with the pasted JSON when the primary is pressed', async () => {
    const onConfirm = jest.fn(async (): Promise<RestoreResult> => ({ ok: true }));
    const screen = renderSheet(
      <RestoreBackupSheet open onCancel={() => {}} onConfirm={onConfirm} />,
    );
    fireEvent.changeText(screen.getByTestId('restore-paste-field'), '{"some":"json"}');
    await act(async () => {
      fireEvent.press(screen.getByTestId('restore-confirm'));
    });
    expect(onConfirm).toHaveBeenCalledWith('{"some":"json"}');
  });

  it('surfaces the precise failure message when onConfirm reports invalid-json', async () => {
    const onConfirm = jest.fn(
      async (): Promise<RestoreResult> => ({ ok: false, reason: 'invalid-json' }),
    );
    const screen = renderSheet(
      <RestoreBackupSheet open onCancel={() => {}} onConfirm={onConfirm} />,
    );
    fireEvent.changeText(screen.getByTestId('restore-paste-field'), 'garbage');
    await act(async () => {
      fireEvent.press(screen.getByTestId('restore-confirm'));
    });
    await waitFor(() => {
      expect(screen.getByText(/That doesn't look like valid backup JSON/)).toBeTruthy();
    });
  });

  it('shows the version-mismatch message for an unsupported backup', async () => {
    const onConfirm = jest.fn(
      async (): Promise<RestoreResult> => ({ ok: false, reason: 'unsupported-version' }),
    );
    const screen = renderSheet(
      <RestoreBackupSheet open onCancel={() => {}} onConfirm={onConfirm} />,
    );
    fireEvent.changeText(screen.getByTestId('restore-paste-field'), '{"schemaVersion":999}');
    await act(async () => {
      fireEvent.press(screen.getByTestId('restore-confirm'));
    });
    await waitFor(() => {
      expect(screen.getByText(/made by a newer version of 531/)).toBeTruthy();
    });
  });

  it('disables the cancel button while pending', () => {
    const onCancel = jest.fn();
    const screen = renderSheet(
      <RestoreBackupSheet
        open
        pending
        onCancel={onCancel}
        onConfirm={async () => ({ ok: true })}
      />,
    );
    fireEvent.press(screen.getByTestId('restore-cancel'));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('shows the Restoring status line while pending', () => {
    const screen = renderSheet(
      <RestoreBackupSheet
        open
        pending
        onCancel={() => {}}
        onConfirm={async () => ({ ok: true })}
      />,
    );
    expect(screen.getByText('Restoring…')).toBeTruthy();
  });
});
