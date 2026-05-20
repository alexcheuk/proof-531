jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
}));

import * as Sentry from '@sentry/react-native';
import { initSentry } from '../sentry';

describe('initSentry', () => {
  const originalDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  afterEach(() => {
    if (originalDsn === undefined) {
      // biome-ignore lint/performance/noDelete: env var must be removed, not set to "undefined" string
      delete process.env.EXPO_PUBLIC_SENTRY_DSN;
    } else {
      process.env.EXPO_PUBLIC_SENTRY_DSN = originalDsn;
    }
    (Sentry.init as jest.Mock).mockClear();
  });

  it('calls Sentry.init when DSN is set', () => {
    process.env.EXPO_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';
    initSentry();
    expect(Sentry.init).toHaveBeenCalledTimes(1);
    expect((Sentry.init as jest.Mock).mock.calls[0][0].dsn).toBe('https://test@sentry.io/123');
  });

  it('does NOT call Sentry.init when DSN is unset', () => {
    // biome-ignore lint/performance/noDelete: env var must be removed, not set to "undefined" string
    delete process.env.EXPO_PUBLIC_SENTRY_DSN;
    initSentry();
    expect(Sentry.init).not.toHaveBeenCalled();
  });
});
