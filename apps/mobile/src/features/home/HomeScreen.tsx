import { useActiveSession } from '@/data/queries/useActiveSession';
import { useLatestTms } from '@/data/queries/useLatestTm';
import { usePrs } from '@/data/queries/usePrs';
import { useSettings } from '@/data/queries/useSettings';
import { Masthead } from '@/design/primitives/Masthead';
import { ResumeBanner } from '@/design/primitives/ResumeBanner';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
/**
 * Home screen — composes Masthead + LiftTabs + a horizontal swipe carousel of
 * `LiftPage`s, one page per enabled lift.
 *
 * Ported from `~/Development/531-pwa/src/features/home/HomeScreen.tsx`. The
 * PWA uses a CSS-snap horizontal scroll container; the RN port uses a
 * `pagingEnabled` horizontal `FlatList` keyed on the lift, with
 * `onMomentumScrollEnd` driving `setSelectedLift` and a `scrollToIndex`
 * effect that re-syncs when the selected lift changes externally (e.g. via
 * a LiftTab tap).
 *
 * Boundary: this file lives under `features/` and composes design
 * primitives + data queries — it never imports drizzle directly.
 * Session creation lives in TodayScreen so that an unrelated tap-back
 * here doesn't leave an orphaned session row behind.
 */
import { motion as motionTokens } from '@/design/tokens';
import { dateLabel, liftDisplayName, relativeTimeLabel } from '@/domain/labels';
import type { Lift } from '@/domain/types';
import { QueryShell, combineQueries } from '@/features/shared/QueryShell';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  View,
  type ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LiftPage } from './components/LiftPage';
import { LiftTabs } from './components/LiftTabs';
import { useHomeScreenState } from './hooks/useHomeScreenState';

export function HomeScreen() {
  const router = useRouter();
  const settings = useSettings();
  const tms = useLatestTms();
  const prs = usePrs();
  const activeSession = useActiveSession();

  const enabledLifts = useMemo<Lift[]>(
    () => settings.data?.enabledLifts ?? [],
    [settings.data?.enabledLifts],
  );
  const firstLift: Lift = enabledLifts[0] ?? 'squat';
  const { selectedLift, setSelectedLift, inProgressLift } = useHomeScreenState(
    firstLift,
    enabledLifts,
  );

  // Resume banner — session-local dismissal. State resets on every Home mount
  // (tab switch, app background, app kill), which keeps the recovery surface
  // present whenever an orphaned in-progress session exists.
  const [resumeBannerDismissed, setResumeBannerDismissed] = useState(false);
  const handleResumeBannerPress = useCallback(() => {
    if (!activeSession.data) return;
    Haptics.selectionAsync();
    router.push({
      pathname: '/session/live',
      params: { sessionId: String(activeSession.data.id) },
    } as never);
  }, [activeSession.data, router]);
  const handleResumeBannerDismiss = useCallback(() => {
    setResumeBannerDismissed(true);
  }, []);

  const listRef = useRef<FlatList<Lift>>(null);
  // Live width — rotates with the device so carousel page math, item
  // layout, and momentum-end index calculation stay correct under
  // orientation change.
  const { width: screenWidth } = useWindowDimensions();

  // If onboarding has not produced an enabled-lifts set, redirect.
  useEffect(() => {
    if (settings.data && settings.data.enabledLifts.length === 0) {
      router.replace('/onboarding');
    }
  }, [settings.data, router]);

  // Sync the carousel position when selectedLift changes externally
  // (e.g. via tab tap or settings edit). Guarded against out-of-range.
  useEffect(() => {
    const idx = enabledLifts.indexOf(selectedLift);
    if (idx >= 0 && listRef.current) {
      // Defer to next tick so initial mount has a layout to scroll within.
      // `scrollToIndex` is a no-op if the list isn't rendered yet, but on
      // Expo SDK 55 a microtask is enough for the initial layout pass.
      try {
        listRef.current.scrollToIndex({ index: idx, animated: true });
      } catch {
        // scrollToIndex can throw before initial layout; ignore.
      }
    }
  }, [selectedLift, enabledLifts]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
      const lift = enabledLifts[idx];
      if (lift && lift !== selectedLift) {
        setSelectedLift(lift);
      }
    },
    [enabledLifts, selectedLift, screenWidth, setSelectedLift],
  );

  const handleBegin = useCallback(
    (lift: Lift) => {
      // Single-session invariant (§4): if another lift is mid-session, do not
      // start a second one. Navigate to that lift instead.
      // Session creation itself happens in TodayScreen (preview mode) so we
      // don't insert a row that an unrelated tap-back leaves orphaned.
      const target = inProgressLift && inProgressLift !== lift ? inProgressLift : lift;
      // typedRoutes is disabled (PF-05); cast the params object.
      router.push({ pathname: '/session/today', params: { lift: target } } as never);
    },
    [inProgressLift, router],
  );

  const handleResume = useCallback(
    (lift: Lift) => {
      router.push({ pathname: '/session/today', params: { lift } } as never);
    },
    [router],
  );

  const handleOpenPlan = useCallback(
    (lift: Lift) => {
      router.push({ pathname: '/session/today', params: { lift } } as never);
    },
    [router],
  );

  const settingsData = settings.data;
  const tmsData = tms.data;
  const prsData = prs.data;

  const renderItem = useCallback<ListRenderItem<Lift>>(
    ({ item: lift }) => {
      if (!settingsData) return null;
      const tmRow = tmsData?.find((t) => t.lift === lift);
      const pr = prsData?.find((p) => p.lift === lift);
      const storageUnit = tmRow?.unit ?? settingsData.storageUnit;
      const displayUnit = settingsData.displayUnit ?? settingsData.storageUnit;
      return (
        <View style={{ width: screenWidth }}>
          <LiftPage
            lift={lift}
            week={settingsData.week}
            cycle={settingsData.currentCycle}
            storageUnit={storageUnit}
            displayUnit={displayUnit}
            plateSet={settingsData.plateSet}
            tm={tmRow?.value ?? null}
            bestE1RM={pr?.bestE1RM ?? null}
            isInProgress={lift === inProgressLift}
            onBegin={() => handleBegin(lift)}
            onResume={() => handleResume(lift)}
            onOpenPlan={() => handleOpenPlan(lift)}
          />
        </View>
      );
    },
    [
      settingsData,
      tmsData,
      prsData,
      inProgressLift,
      screenWidth,
      handleBegin,
      handleResume,
      handleOpenPlan,
    ],
  );

  const combined = combineQueries(settings, tms, prs);
  if (combined.isLoading || combined.isError) {
    return (
      <Container>
        <QueryShell query={combined}>{null}</QueryShell>
      </Container>
    );
  }
  if (!settings.data || enabledLifts.length === 0) {
    return null;
  }

  // If the selected lift is no longer enabled (e.g. settings edit), snap
  // back to the first enabled lift.
  const selectedToRender = enabledLifts.includes(selectedLift) ? selectedLift : firstLift;
  const initialIdx = Math.max(0, enabledLifts.indexOf(selectedToRender));

  const activeSessionRow = activeSession.data;
  const showResumeBanner = !!activeSessionRow && !resumeBannerDismissed;
  const resumeBannerLiftLabel = activeSessionRow
    ? liftDisplayName(activeSessionRow.lift as Lift)
    : '';
  const resumeBannerRelative = activeSessionRow
    ? relativeTimeLabel(activeSessionRow.startedAt, Date.now())
    : '';

  return (
    <Container>
      <Masthead rightSlot={<DateBadge label={dateLabel(new Date())} />} />
      <LiftTabs
        enabled={enabledLifts}
        selected={selectedToRender}
        inProgressLift={inProgressLift}
        onSelect={setSelectedLift}
      />
      {showResumeBanner ? (
        <SwipeDismissibleResumeBanner
          onDismiss={handleResumeBannerDismiss}
          liftLabel={resumeBannerLiftLabel}
          relativeTime={resumeBannerRelative}
          onResume={handleResumeBannerPress}
        />
      ) : null}
      <FlatList
        ref={listRef}
        testID="home-lift-carousel"
        data={enabledLifts}
        keyExtractor={(l) => l}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, i) => ({
          length: screenWidth,
          offset: screenWidth * i,
          index: i,
        })}
        initialScrollIndex={initialIdx}
        initialNumToRender={enabledLifts.length}
        windowSize={enabledLifts.length || 1}
      />
    </Container>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const style: ViewStyle = {
    flex: 1,
    backgroundColor: colors.bg0,
  };
  return (
    <View style={style}>
      <StatusBar style="dark" />
      {children}
    </View>
  );
}

function DateBadge({ label }: { label: string }) {
  return (
    <Text
      variant="mono"
      weight="medium"
      size={10}
      color="ink2"
      style={{ textTransform: 'uppercase', letterSpacing: 1.8 }}
    >
      {label}
    </Text>
  );
}

/**
 * Wave 3 W3-D — swipe-left dismiss gesture wrapper for the Resume banner.
 *
 * Wraps the `ResumeBanner` primitive with a Reanimated `Gesture.Pan` so the
 * user can swipe left to dismiss without taking the accessibility-action
 * path. The primitive itself stays render-only — the swipe lives at the
 * feature layer so the primitive can be reused elsewhere without the
 * gesture entanglement.
 *
 * Behavior per spec W1.1 "Dismissal model":
 *   - 250ms grace period after mount during which the gesture is disabled
 *     (prevents accidental swipe-down-on-list events from being routed to
 *     the band on initial mount).
 *   - Threshold: translation > 80pt OR velocity > 800pt/s left.
 *   - Snap: `translateX = -screenWidth` with `withTiming(durationBase,
 *     Easing.bezier(...easeStandardBezier))`, then `onDismiss` fires via
 *     `runOnJS`.
 *   - Below-threshold release: snap back to 0 with the same easing.
 *   - Reduced-motion fallback (`useReducedMotion()`): the gesture is
 *     replaced by an immediate `onDismiss` call with no translate tween;
 *     the `accessibilityActions: dismiss` route inside the primitive
 *     remains the canonical assistive path.
 */
function SwipeDismissibleResumeBanner({
  onDismiss,
  liftLabel,
  relativeTime,
  onResume,
}: {
  onDismiss: () => void;
  liftLabel: string;
  relativeTime: string;
  onResume: () => void;
}) {
  const translateX = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  const screenWidth = Dimensions.get('window').width;
  const [graceElapsed, setGraceElapsed] = useState(false);

  useEffect(() => {
    // 250ms grace period — prevents the gesture from firing on mount.
    const id = setTimeout(() => setGraceElapsed(true), 250);
    return () => clearTimeout(id);
  }, []);

  const completeDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  // Build the gesture once. Reanimated worklets reference shared values
  // directly; `runOnJS` bridges back to the JS thread for the dismiss
  // callback. The gesture is `.enabled(graceElapsed && !reduceMotion)` so
  // (a) the initial 250ms window swallows accidental flicks and (b)
  // reduced-motion users fall back to the in-primitive accessibility
  // action.
  const gesture = Gesture.Pan()
    .enabled(graceElapsed && !reduceMotion)
    .activeOffsetX([-12, 12])
    .onUpdate((e: { translationX: number }) => {
      'worklet';
      if (e.translationX < 0) translateX.value = e.translationX;
    })
    .onEnd((e: { translationX: number; velocityX: number }) => {
      'worklet';
      const past80 = e.translationX < -80;
      const fastLeft = e.velocityX < -800;
      if (past80 || fastLeft) {
        translateX.value = withTiming(
          -screenWidth,
          {
            duration: motionTokens.durationBase,
            easing: Easing.bezier(...motionTokens.easeStandardBezier),
          },
          () => {
            runOnJS(completeDismiss)();
          },
        );
      } else {
        translateX.value = withTiming(0, {
          duration: motionTokens.durationBase,
          easing: Easing.bezier(...motionTokens.easeStandardBezier),
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle}>
        <ResumeBanner
          liftLabel={liftLabel}
          relativeTime={relativeTime}
          onResume={onResume}
          onDismiss={onDismiss}
          accessibilityLabel={`Resume ${liftLabel} session, started ${relativeTime}`}
          accessibilityHint="Opens the live session screen."
          testID="home-resume-banner"
        />
      </Animated.View>
    </GestureDetector>
  );
}
