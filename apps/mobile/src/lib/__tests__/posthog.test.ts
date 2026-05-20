/**
 * Mocks for the PostHog SDK. Jest hoists `jest.mock(...)` above imports, so
 * the factory must define its own state and expose it via the mocked module's
 * named helpers. Tests pull `__mock` off the mocked module to assert against
 * the underlying jest fns.
 *
 * Variables referenced inside the factory must be prefixed with `mock` per
 * Jest's allow-list.
 */
jest.mock('posthog-react-native', () => {
  const mockOptIn = jest.fn();
  const mockOptOut = jest.fn();
  const mockCapture = jest.fn();
  const mockReady = jest.fn(() => Promise.resolve());

  const mockInstance = {
    optIn: mockOptIn,
    optOut: mockOptOut,
    capture: mockCapture,
    ready: mockReady,
  };

  const mockCtor = jest.fn().mockImplementation(() => mockInstance);

  // Hang the spies off the constructor so the test can read them.
  // biome-ignore lint/suspicious/noExplicitAny: test plumbing
  (mockCtor as any).__mock = {
    optIn: mockOptIn,
    optOut: mockOptOut,
    capture: mockCapture,
    ready: mockReady,
    instance: mockInstance,
    ctor: mockCtor,
  };

  // ESM/CJS interop: support both `import PostHog from 'posthog-react-native'`
  // (which babel reads `_module.default`) and `require('posthog-react-native')`.
  // biome-ignore lint/suspicious/noExplicitAny: test plumbing
  (mockCtor as any).default = mockCtor;
  // biome-ignore lint/suspicious/noExplicitAny: test plumbing
  (mockCtor as any).__esModule = true;
  return mockCtor;
});

import PostHog from 'posthog-react-native';
import {
  __resetPostHogForTests,
  getPostHog,
  initPostHog,
  setAnalyticsEnabled,
  trackEvent,
} from '../posthog';

// biome-ignore lint/suspicious/noExplicitAny: test plumbing
const PH = PostHog as unknown as jest.Mock & { __mock: any };
const mock = PH.__mock;

const ORIGINAL_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
const ORIGINAL_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST;

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

describe('lib/posthog', () => {
  beforeEach(() => {
    mock.optIn.mockClear();
    mock.optOut.mockClear();
    mock.capture.mockClear();
    mock.ready.mockClear();
    mock.ctor.mockClear();
    __resetPostHogForTests();
  });

  afterEach(() => {
    restoreEnv('EXPO_PUBLIC_POSTHOG_API_KEY', ORIGINAL_KEY);
    restoreEnv('EXPO_PUBLIC_POSTHOG_HOST', ORIGINAL_HOST);
  });

  describe('initPostHog', () => {
    it('does nothing when API key is missing', async () => {
      // biome-ignore lint/performance/noDelete: env semantics
      delete process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
      await initPostHog();
      expect(mock.ctor).not.toHaveBeenCalled();
      expect(getPostHog()).toBeNull();
    });

    it('creates a disabled client when API key is set', async () => {
      process.env.EXPO_PUBLIC_POSTHOG_API_KEY = 'phc_test';
      await initPostHog();
      expect(mock.ctor).toHaveBeenCalledTimes(1);
      const [key, options] = mock.ctor.mock.calls[0];
      expect(key).toBe('phc_test');
      expect(options).toMatchObject({ disabled: true });
      expect(getPostHog()).toBe(mock.instance);
    });

    it('uses default host when EXPO_PUBLIC_POSTHOG_HOST is unset', async () => {
      process.env.EXPO_PUBLIC_POSTHOG_API_KEY = 'phc_test';
      // biome-ignore lint/performance/noDelete: env semantics
      delete process.env.EXPO_PUBLIC_POSTHOG_HOST;
      await initPostHog();
      expect(mock.ctor.mock.calls[0][1]).toMatchObject({
        host: 'https://us.i.posthog.com',
      });
    });

    it('respects EXPO_PUBLIC_POSTHOG_HOST override', async () => {
      process.env.EXPO_PUBLIC_POSTHOG_API_KEY = 'phc_test';
      process.env.EXPO_PUBLIC_POSTHOG_HOST = 'https://eu.i.posthog.com';
      await initPostHog();
      expect(mock.ctor.mock.calls[0][1]).toMatchObject({
        host: 'https://eu.i.posthog.com',
      });
    });

    it('is idempotent', async () => {
      process.env.EXPO_PUBLIC_POSTHOG_API_KEY = 'phc_test';
      await initPostHog();
      await initPostHog();
      expect(mock.ctor).toHaveBeenCalledTimes(1);
    });
  });

  describe('setAnalyticsEnabled', () => {
    it('no-ops when client is not initialized', () => {
      setAnalyticsEnabled(true);
      setAnalyticsEnabled(false);
      expect(mock.optIn).not.toHaveBeenCalled();
      expect(mock.optOut).not.toHaveBeenCalled();
    });

    it('calls optIn when enabled = true', async () => {
      process.env.EXPO_PUBLIC_POSTHOG_API_KEY = 'phc_test';
      await initPostHog();
      setAnalyticsEnabled(true);
      expect(mock.optIn).toHaveBeenCalledTimes(1);
      expect(mock.optOut).not.toHaveBeenCalled();
    });

    it('calls optOut when enabled = false', async () => {
      process.env.EXPO_PUBLIC_POSTHOG_API_KEY = 'phc_test';
      await initPostHog();
      setAnalyticsEnabled(false);
      expect(mock.optOut).toHaveBeenCalledTimes(1);
      expect(mock.optIn).not.toHaveBeenCalled();
    });
  });

  describe('trackEvent (no tracking when client is not initialized)', () => {
    it('no-ops when client is not initialized (toggle OFF / no key)', () => {
      trackEvent({ name: 'onboarding_complete' });
      trackEvent({
        name: 'set_completed',
        properties: { liftId: 'squat', weight: 315, reps: 5 },
      });
      trackEvent({ name: 'pr_detected', properties: { liftId: 'bench', e1rm: 225 } });
      trackEvent({
        name: 'cycle_advanced',
        properties: { fromCycle: 1, toCycle: 2 },
      });
      expect(mock.capture).not.toHaveBeenCalled();
    });
  });

  describe('trackEvent (with client initialized)', () => {
    beforeEach(async () => {
      process.env.EXPO_PUBLIC_POSTHOG_API_KEY = 'phc_test';
      await initPostHog();
    });

    it('captures onboarding_complete with no properties', () => {
      trackEvent({ name: 'onboarding_complete' });
      expect(mock.capture).toHaveBeenCalledWith('onboarding_complete', undefined);
    });

    it('captures set_completed with properties', () => {
      trackEvent({
        name: 'set_completed',
        properties: { liftId: 'squat', weight: 315, reps: 5 },
      });
      expect(mock.capture).toHaveBeenCalledWith('set_completed', {
        liftId: 'squat',
        weight: 315,
        reps: 5,
      });
    });

    it('captures pr_detected with properties', () => {
      trackEvent({
        name: 'pr_detected',
        properties: { liftId: 'bench', e1rm: 225.5 },
      });
      expect(mock.capture).toHaveBeenCalledWith('pr_detected', {
        liftId: 'bench',
        e1rm: 225.5,
      });
    });

    it('captures cycle_advanced with properties', () => {
      trackEvent({
        name: 'cycle_advanced',
        properties: { fromCycle: 1, toCycle: 2 },
      });
      expect(mock.capture).toHaveBeenCalledWith('cycle_advanced', {
        fromCycle: 1,
        toCycle: 2,
      });
    });
  });
});
