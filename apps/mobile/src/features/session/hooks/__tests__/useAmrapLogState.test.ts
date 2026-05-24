import { act, renderHook } from '@testing-library/react-native';
import { useAmrapLogState } from '../useAmrapLogState';

describe('useAmrapLogState', () => {
  it('seeds reps to prescribedReps on first render', () => {
    const { result } = renderHook(() =>
      useAmrapLogState({
        open: true,
        prescribedReps: 5,
        onSave: jest.fn(),
        onCancel: jest.fn(),
      }),
    );
    expect(result.current.reps).toBe(5);
    expect(result.current.pending).toBe(false);
  });

  it('resets reps + pending when `open` flips back to true', async () => {
    type Props = { open: boolean };
    const { result, rerender } = renderHook(
      (props: Props) =>
        useAmrapLogState({
          open: props.open,
          prescribedReps: 5,
          onSave: jest.fn(),
          onCancel: jest.fn(),
        }),
      { initialProps: { open: true } as Props },
    );

    act(() => result.current.setReps(8));
    expect(result.current.reps).toBe(8);

    rerender({ open: false });
    rerender({ open: true });
    expect(result.current.reps).toBe(5);
    expect(result.current.pending).toBe(false);
  });

  it('handleSave awaits async onSave and stays pending on success', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useAmrapLogState({ open: true, prescribedReps: 5, onSave, onCancel: jest.fn() }),
    );

    await act(async () => {
      await result.current.handleSave();
    });

    expect(onSave).toHaveBeenCalledWith(5);
    // Parent is expected to unmount the sheet; pending stays true on success.
    expect(result.current.pending).toBe(true);
  });

  it('handleSave clears pending when onSave throws', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const onSave = jest.fn().mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() =>
      useAmrapLogState({ open: true, prescribedReps: 3, onSave, onCancel: jest.fn() }),
    );

    await act(async () => {
      await result.current.handleSave();
    });

    expect(result.current.pending).toBe(false);
    consoleError.mockRestore();
  });

  it('handleSave is a no-op while pending', async () => {
    const onSave = jest.fn((): Promise<void> => new Promise<void>(() => {}));
    const { result } = renderHook(() =>
      useAmrapLogState({ open: true, prescribedReps: 5, onSave, onCancel: jest.fn() }),
    );

    await act(async () => {
      void result.current.handleSave();
    });
    expect(result.current.pending).toBe(true);

    await act(async () => {
      await result.current.handleSave();
    });
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('handleCancel ignores presses while pending', async () => {
    const onCancel = jest.fn();
    const onSave = jest.fn((): Promise<void> => new Promise<void>(() => {}));
    const { result } = renderHook(() =>
      useAmrapLogState({ open: true, prescribedReps: 5, onSave, onCancel }),
    );

    await act(async () => {
      void result.current.handleSave();
    });

    act(() => result.current.handleCancel());
    expect(onCancel).not.toHaveBeenCalled();
  });
});
