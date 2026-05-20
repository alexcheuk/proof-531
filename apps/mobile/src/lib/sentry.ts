import * as Sentry from '@sentry/react-native';

export function initSentry(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[sentry] EXPO_PUBLIC_SENTRY_DSN not set; Sentry disabled');
    }
    return;
  }
  Sentry.init({
    dsn,
    enabled: !__DEV__,
    tracesSampleRate: 0.1,
  });
}

export { Sentry };
