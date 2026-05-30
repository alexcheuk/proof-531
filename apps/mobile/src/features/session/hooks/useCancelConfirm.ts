import { useCallback, useEffect, useState } from 'react';

export type UseCancelConfirmOptions = {
  /** Milliseconds to keep `armed` true before silently reverting. */
  timeoutMs?: number;
  /** Fires on the arm tap. */
  onArmHaptic?: () => void;
};

export type UseCancelConfirmResult = {
  armed: boolean;
  arm: () => void;
  disarm: () => void;
  /**
   * Run `fn` when armed; otherwise arm (and return undefined).
   * Returns a promise so async destroy paths can be awaited.
   */
  attemptDestroy: (fn: () => void | Promise<void>) => Promise<void>;
};

const DEFAULT_TIMEOUT_MS = 8000;

export function useCancelConfirm(options: UseCancelConfirmOptions = {}): UseCancelConfirmResult {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const onArmHaptic = options.onArmHaptic;
  const [armed, setArmed] = useState(false);

  // Auto-disarm: when the destructive button has been armed for `timeoutMs`
  // without a second tap, silently revert. The user must tap once more to
  // re-arm. Without this, the armed state could persist for the rest of the
  // session — a real footgun.
  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => {
      setArmed(false);
    }, timeoutMs);
    return () => {
      clearTimeout(id);
    };
  }, [armed, timeoutMs]);

  const arm = useCallback(() => {
    setArmed(true);
    onArmHaptic?.();
  }, [onArmHaptic]);

  const disarm = useCallback(() => {
    setArmed(false);
  }, []);

  const attemptDestroy = useCallback(
    async (fn: () => void | Promise<void>): Promise<void> => {
      if (!armed) {
        setArmed(true);
        onArmHaptic?.();
        return;
      }
      await Promise.resolve(fn());
    },
    [armed, onArmHaptic],
  );

  return { armed, arm, disarm, attemptDestroy };
}
