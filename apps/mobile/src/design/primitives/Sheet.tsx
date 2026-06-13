import { useTheme } from '@/design/theme';
import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, type ViewStyle } from 'react-native';

type SheetProps = {
  open: boolean;
  onDismiss: () => void;
  children: ReactNode;
  snapPoints?: (string | number)[];
  /**
   * Override the paper background color. Defaults to `colors.bg0` so sheets
   * blend with the app canvas (gorhom's default is white, which clashes with
   * the paper-tone theme).
   */
  backgroundColor?: string;
  testID?: string;
};

const DEFAULT_SNAP_POINTS: (string | number)[] = ['50%'];

export function Sheet({
  open,
  onDismiss,
  children,
  snapPoints,
  backgroundColor,
  testID,
}: SheetProps) {
  const { colors, spacing } = useTheme();
  const sheetRef = useRef<BottomSheet>(null);
  // Capture the initial `open` value once so we can seed gorhom's
  // initial `index` (gorhom v5 docs say `index` is initial-only). This
  // matters for screens that conditionally mount the sheet AS open  -
  // Settings' TM-edit / unit-migration / reset-everything sheets all
  // do this. Without seeding, the sheet would mount at -1 and rely on
  // the effect below to snap it open, which races gorhom's internal
  // ref attachment on a fresh mount and silently fails (the press
  // fires, state updates, sheet stays off-screen).
  const [initialIndex] = useState(open ? 0 : -1);
  const effectiveSnapPoints = snapPoints ?? DEFAULT_SNAP_POINTS;
  const effectiveBackground = backgroundColor ?? colors.bg0;
  const backgroundStyle = useMemo<ViewStyle>(
    () => ({ backgroundColor: effectiveBackground }),
    [effectiveBackground],
  );
  // Reserve breathing room below the last interactive element so sheet CTAs
  // don't sit flush against the home indicator / bottom edge. `xxl` is one
  // step above the sheet's own inner `lg` padding for a comfortable gutter.
  const contentContainerStyle = useMemo<ViewStyle>(
    () => ({ paddingBottom: spacing.xxl }),
    [spacing.xxl],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleChange = useCallback((idx: number) => {
    if (idx === 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleClose = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  // Drive open/close imperatively for subsequent state changes. gorhom
  // v5 documents `index` as initial-only  -  re-rendering with
  // `index={-1}` does not reliably close the sheet (AmrapLogSheet
  // cancel regression, Discord 1508365310359633990). So we keep the
  // imperative effect for transitions, BUT we also seed the initial
  // index off `open` below so a fresh mount with `open=true` (Settings
  // conditionally mounts its sheets  -  TM edit, unit migration, reset
  // everything) shows the sheet on first paint instead of waiting for
  // an effect-driven snap that races gorhom's ref attachment.
  useEffect(() => {
    if (open) {
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onDismiss();
      return true;
    });
    return () => {
      subscription.remove();
    };
  }, [open, onDismiss]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={initialIndex}
      snapPoints={effectiveSnapPoints}
      enablePanDownToClose
      onChange={handleChange}
      onClose={handleClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={backgroundStyle}
    >
      <BottomSheetView testID={testID} style={contentContainerStyle}>
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
}
