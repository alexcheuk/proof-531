import { act, renderHook } from '@testing-library/react-native';
import { useTmTestLogState } from '../useTmTestLogState';

describe('useTmTestLogState', () => {
  it('seeds reps to 0 on first render (deliberate entry  -  no editorial pressure)', () => {
    const { result } = renderHook(() =>
      useTmTestLogState({
        open: true,
        onSave: jest.fn(),
        onCancel: jest.fn(),
      }),
    );
    expect(result.current.reps).toBe(0);
    expect(result.current.pending).toBe(false);
  });

  it('resets reps + pending when `open` flips back to true', async () => {
    type Props = { open: boolean };
    const { result, rerender } = renderHook(
      (props: Props) =>
        useTmTestLogState({
          open: props.open,
          onSave: jest.fn(),
          onCancel: jest.fn(),
        }),
      { initialProps: { open: true } as Props },
    );

    act(() => result.current.setReps(4));
    expect(result.current.reps).toBe(4);

    rerender({ open: false });
    rerender({ open: true });
    expect(result.current.reps).toBe(0);
    expect(result.current.pending).toBe(false);
  });

  it('handleSave awaits async onSave and clears pending on success', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useTmTestLogState({ open: true, onSave, onCancel: jest.fn() }),
    );

    act(() => result.current.setReps(5));

    await act(async () => {
      await result.current.handleSave();
    });

    expect(onSave).toHaveBeenCalledWith(5);
    expect(result.current.pending).toBe(false);
  });

  it('handleSave clears pending when onSave throws', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const onSave = jest.fn().mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() =>
      useTmTestLogState({ open: true, onSave, onCancel: jest.fn() }),
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
      useTmTestLogState({ open: true, onSave, onCancel: jest.fn() }),
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
    const { result } = renderHook(() => useTmTestLogState({ open: true, onSave, onCancel }));

    await act(async () => {
      void result.current.handleSave();
    });

    act(() => result.current.handleCancel());
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('handleCancel is a no-op when sheet is already closed (gorhom auto-dismiss guard)', () => {
    const onCancel = jest.fn();
    type Props = { open: boolean };
    const { result, rerender } = renderHook(
      (props: Props) => useTmTestLogState({ open: props.open, onSave: jest.fn(), onCancel }),
      { initialProps: { open: true } as Props },
    );

    rerender({ open: false });
    act(() => result.current.handleCancel());
    expect(onCancel).not.toHaveBeenCalled();
  });
});
