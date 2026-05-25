import { useTheme } from '@/design/theme';
import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { type ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
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

  // Drive open/close imperatively. gorhom v5 documents `index` as
  // initial-only — re-rendering with `index={-1}` does not reliably
  // close the sheet. The Cancel button regression on the AmrapLogSheet
  // (Discord 1508365310359633990) was the second time we hit this; the
  // first "fix" relied on the prop happening to re-snap. Make it
  // explicit: open → snapToIndex(0), closed → close().
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
      index={-1}
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
