import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import type { ReactElement } from 'react';
import { BackHandler, Text } from 'react-native';
import { Sheet } from './Sheet';

const renderWithTheme = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));

const mockOnChangeRef: { current: ((idx: number) => void) | null } = { current: null };
const mockOnCloseRef: { current: (() => void) | null } = { current: null };
const mockBackdropPropsRef: {
  current: {
    onPress?: () => void;
    pressBehavior?: string;
    appearsOnIndex?: number;
    disappearsOnIndex?: number;
  } | null;
} = { current: null };

type MockBottomSheetProps = {
  children?: React.ReactNode;
  onChange?: (idx: number) => void;
  onClose?: () => void;
  backdropComponent?: (props: {
    animatedIndex: { value: number };
    animatedPosition: { value: number };
  }) => React.ReactNode;
};
type MockBackdropProps = {
  onPress?: () => void;
  pressBehavior?: string;
  appearsOnIndex?: number;
  disappearsOnIndex?: number;
};
type MockViewProps = { children?: React.ReactNode };

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ children, onChange, onClose, backdropComponent }: MockBottomSheetProps) => {
      mockOnChangeRef.current = onChange ?? null;
      mockOnCloseRef.current = onClose ?? null;
      const backdrop = backdropComponent
        ? backdropComponent({
            animatedIndex: { value: 0 },
            animatedPosition: { value: 0 },
          })
        : null;
      return React.createElement(React.Fragment, null, backdrop, children);
    },
    BottomSheetBackdrop: (props: MockBackdropProps) => {
      mockBackdropPropsRef.current = props;
      const React = require('react');
      return React.createElement('BackdropMock', { testID: 'sheet-backdrop' });
    },
    BottomSheetView: ({ children }: MockViewProps) => {
      const React = require('react');
      return React.createElement(React.Fragment, null, children);
    },
  };
});

describe('Sheet', () => {
  const removeMock = jest.fn();
  let addEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    (Haptics.impactAsync as jest.Mock).mockClear();
    removeMock.mockClear();
    mockOnChangeRef.current = null;
    mockOnCloseRef.current = null;
    mockBackdropPropsRef.current = null;
    addEventListenerSpy = jest
      .spyOn(BackHandler, 'addEventListener')
      .mockImplementation(
        () => ({ remove: removeMock }) as ReturnType<typeof BackHandler.addEventListener>,
      );
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
  });

  it('configures backdrop with pressBehavior="close" and dismisses via onClose', () => {
    const onDismiss = jest.fn();
    renderWithTheme(
      <Sheet open onDismiss={onDismiss}>
        <Text>body</Text>
      </Sheet>,
    );

    expect(mockBackdropPropsRef.current?.pressBehavior).toBe('close');
    expect(mockBackdropPropsRef.current?.appearsOnIndex).toBe(0);
    expect(mockBackdropPropsRef.current?.disappearsOnIndex).toBe(-1);

    // Simulate gorhom's close path (which the backdrop tap triggers when pressBehavior="close").
    mockOnCloseRef.current?.();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('registers a hardware-back handler that dismisses the sheet and consumes the event', () => {
    const onDismiss = jest.fn();
    renderWithTheme(
      <Sheet open onDismiss={onDismiss}>
        <Text>body</Text>
      </Sheet>,
    );

    expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
    const [eventName, handler] = addEventListenerSpy.mock.calls[0] as [string, () => boolean];
    expect(eventName).toBe('hardwareBackPress');

    const result = handler();
    expect(result).toBe(true);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('fires Haptics.impactAsync("light") when snapping to opened index 0, not on close index -1', () => {
    renderWithTheme(
      <Sheet open onDismiss={() => {}}>
        <Text>body</Text>
      </Sheet>,
    );

    mockOnChangeRef.current?.(0);
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');

    mockOnChangeRef.current?.(-1);
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
  });

  it('does not register a back-handler when closed', () => {
    renderWithTheme(
      <Sheet open={false} onDismiss={() => {}}>
        <Text>body</Text>
      </Sheet>,
    );

    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it('removes the back-handler subscription on unmount', () => {
    const { unmount } = renderWithTheme(
      <Sheet open onDismiss={() => {}}>
        <Text>body</Text>
      </Sheet>,
    );
    expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
    unmount();
    expect(removeMock).toHaveBeenCalledTimes(1);
  });
});
