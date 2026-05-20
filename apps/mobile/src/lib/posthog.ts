import PostHog from 'posthog-react-native';

const POSTHOG_HOST_DEFAULT = 'https://us.i.posthog.com';

let client: PostHog | null = null;

export function getPostHog(): PostHog | null {
  return client;
}

/**
 * Initializes the PostHog client. Idempotent. No-ops if
 * `EXPO_PUBLIC_POSTHOG_API_KEY` is unset.
 *
 * The client starts disabled (`disabled: true`); call `setAnalyticsEnabled(true)`
 * to opt the user in. This matches the spec's "default OFF" requirement.
 */
export async function initPostHog(): Promise<void> {
  if (client) return;
  const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
  if (!apiKey) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[posthog] EXPO_PUBLIC_POSTHOG_API_KEY not set; analytics disabled');
    }
    return;
  }
  const host = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? POSTHOG_HOST_DEFAULT;
  client = new PostHog(apiKey, { host, disabled: true });
  await client.ready();
}

export function setAnalyticsEnabled(enabled: boolean): void {
  if (!client) return;
  if (enabled) {
    client.optIn();
  } else {
    client.optOut();
  }
}

export type AnalyticsEvent =
  | { name: 'onboarding_complete' }
  | { name: 'set_completed'; properties: { liftId: string; weight: number; reps: number } }
  | { name: 'pr_detected'; properties: { liftId: string; e1rm: number } }
  | { name: 'cycle_advanced'; properties: { fromCycle: number; toCycle: number } };

export function trackEvent(event: AnalyticsEvent): void {
  if (!client) return;
  const properties = 'properties' in event ? event.properties : undefined;
  client.capture(event.name, properties);
}

/**
 * Test-only helper. Resets the singleton so each `initPostHog` call in a test
 * yields a fresh client. Not exported from a public barrel.
 */
export function __resetPostHogForTests(): void {
  client = null;
}
