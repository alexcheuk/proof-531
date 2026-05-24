/**
 * Shared jest setup for `@fivethreeone/mobile`.
 *
 * Wave 3 W3-A — hoists the inline `jest.mock('react-native-reanimated', ...)`
 * pattern that previously lived per-test-file (HomeScreen.test.tsx,
 * LiftPage.test.tsx, etc.) into one place so every component test inherits a
 * consistent mock. Reanimated 4 boots `react-native-worklets` at module load —
 * that native init never lands under jest, so any
 * `import 'react-native-reanimated'` throws. The shipping `mock.js` also
 * pulls worklets, so we substitute a minimal inline mock that:
 *
 *   - Returns a default object with `View` / `Text` / `ScrollView` aliases so
 *     `Animated.View` (etc.) falls through to a plain RN element.
 *   - Stubs the `withTiming` / `withRepeat` / `useSharedValue` / `useAnimatedStyle`
 *     / `useReducedMotion` worklet APIs so feature code that imports them does
 *     not throw at module load.
 *   - Stubs `Easing.bezier`, `LinearTransition`, `FadeIn`, `FadeOut`.
 *   - Stubs Gesture / GestureDetector so the swipe-dismiss feature wrapper on
 *     `ResumeBanner` (W3-D) can mount under jest.
 *
 * Per-test-file `jest.mock('react-native-reanimated', ...)` calls still work —
 * jest's `jest.mock` is per-module and a per-file override re-binds the module
 * resolution. New tests should rely on this shared mock by default; only mock
 * locally when a specific test needs a different shape.
 */

jest.mock('react-native-reanimated', () => {
  const RN = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: { View: RN.View, Text: RN.Text, ScrollView: RN.ScrollView },
    // Layout-animation primitives — used by LiftPage.
    LinearTransition: { duration: () => ({}) },
    FadeIn: { duration: () => ({}) },
    FadeOut: { duration: () => ({}) },
    // Worklet runtime primitives — Wave 3 animations use these.
    useSharedValue: (initial: number) => ({ value: initial }),
    useAnimatedStyle: (factory: () => object) => {
      try {
        return factory();
      } catch {
        return {};
      }
    },
    useReducedMotion: () => false,
    withTiming: (toValue: number) => toValue,
    withRepeat: (value: number) => value,
    withSpring: (toValue: number) => toValue,
    runOnJS:
      <T extends (...args: unknown[]) => unknown>(fn: T) =>
      (...args: Parameters<T>) =>
        fn(...args),
    Easing: {
      bezier: () => ({ factory: () => () => 0 }),
      inOut: () => ({ factory: () => () => 0 }),
      linear: () => ({ factory: () => () => 0 }),
    },
    interpolate: (value: number) => value,
    Extrapolate: { CLAMP: 'clamp' },
    Extrapolation: { CLAMP: 'clamp' },
  };
});

// `react-native-gesture-handler` ships its own jest mock but Wave 3's
// swipe-dismiss wrapper on `ResumeBanner` needs `Gesture.Pan()` to compose at
// module load. The shipping mock covers the imperative path but not the new
// composable `Gesture.X()` factory. Stub the minimum surface.
jest.mock('react-native-gesture-handler', () => {
  const RN = jest.requireActual('react-native');
  // biome-ignore lint/suspicious/noExplicitAny: jest setup file — types are stub
  const chainable = (): any => {
    const obj: Record<string, unknown> = {};
    const methods = [
      'minDistance',
      'maxDistance',
      'activeOffsetX',
      'activeOffsetY',
      'failOffsetX',
      'failOffsetY',
      'onStart',
      'onUpdate',
      'onEnd',
      'onChange',
      'onFinalize',
      'onBegin',
      'enabled',
      'minDuration',
      'maxDuration',
      'shouldCancelWhenOutside',
    ];
    for (const m of methods) {
      obj[m] = () => obj;
    }
    return obj;
  };
  return {
    __esModule: true,
    GestureHandlerRootView: RN.View,
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
    Gesture: {
      Pan: chainable,
      Tap: chainable,
      LongPress: chainable,
      Race: chainable,
      Simultaneous: chainable,
      Exclusive: chainable,
    },
    Directions: { RIGHT: 1, LEFT: 2, UP: 4, DOWN: 8 },
    State: {
      UNDETERMINED: 0,
      FAILED: 1,
      BEGAN: 2,
      CANCELLED: 3,
      ACTIVE: 4,
      END: 5,
    },
  };
});
