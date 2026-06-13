// Jest manual mock for @gorhom/bottom-sheet. The real library needs the
// Reanimated worklets bridge, which doesn't run under jest. Auto-applied for
// the node_modules package so any suite whose tree transitively reaches the
// `Sheet` primitive (e.g. Home's LiftPage / Progress matrix, which now mount
// the read-only DayPreviewSheet) renders the sheet body instead of crashing on
// import. Suites that need to drive open/close or backdrop behavior still
// declare their own local `jest.mock('@gorhom/bottom-sheet', ...)`, which
// overrides this manual mock.
import * as React from 'react';

// biome-ignore lint/suspicious/noExplicitAny: test stub props
type AnyProps = any;

const BottomSheet = ({ children }: AnyProps) => React.createElement(React.Fragment, null, children);

export default BottomSheet;

export const BottomSheetBackdrop = () => null;
export const BottomSheetView = ({ children }: AnyProps) =>
  React.createElement(React.Fragment, null, children);
export const BottomSheetScrollView = ({ children }: AnyProps) =>
  React.createElement(React.Fragment, null, children);
export const BottomSheetTextInput = () => null;
export const BottomSheetModal = ({ children }: AnyProps) =>
  React.createElement(React.Fragment, null, children);
export const BottomSheetModalProvider = ({ children }: AnyProps) =>
  React.createElement(React.Fragment, null, children);
