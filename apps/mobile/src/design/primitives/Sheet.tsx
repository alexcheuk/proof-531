import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { type ReactNode, useCallback, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';

type SheetProps = {
  open: boolean;
  onDismiss: () => void;
  children: ReactNode;
  snapPoints?: (string | number)[];
  testID?: string;
};

const DEFAULT_SNAP_POINTS: (string | number)[] = ['50%'];

export function Sheet({ open, onDismiss, children, snapPoints, testID }: SheetProps) {
  const sheetRef = useRef<BottomSheet>(null);
  const effectiveSnapPoints = snapPoints ?? DEFAULT_SNAP_POINTS;

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
      index={open ? 0 : -1}
      snapPoints={effectiveSnapPoints}
      enablePanDownToClose
      onChange={handleChange}
      onClose={handleClose}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView testID={testID}>{children}</BottomSheetView>
    </BottomSheet>
  );
}
