import {
  _resetStatusBarTintForTests,
  statusBarTintStore,
  useStatusBarTint,
  useStatusBarTintValue,
} from '@/design/statusBarTint';
import { act, render } from '@testing-library/react-native';
import { Text } from 'react-native';

function Consumer() {
  const tint = useStatusBarTintValue();
  return <Text testID="tint">{tint ?? 'none'}</Text>;
}

function Pusher({ color }: { color: string | null }) {
  useStatusBarTint(color);
  return null;
}

describe('statusBarTint', () => {
  beforeEach(() => {
    _resetStatusBarTintForTests();
  });

  it('starts null and exposes it via useStatusBarTintValue', () => {
    const screen = render(<Consumer />);
    expect(screen.getByTestId('tint').props.children).toBe('none');
  });

  it('pushes a color from a mounted consumer and clears on unmount', () => {
    const screen = render(
      <>
        <Pusher color="#abc" />
        <Consumer />
      </>,
    );
    expect(screen.getByTestId('tint').props.children).toBe('#abc');

    act(() => {
      screen.update(<Consumer />);
    });
    expect(screen.getByTestId('tint').props.children).toBe('none');
  });

  it('updates subscribers when a different color is pushed', () => {
    const subscriber = jest.fn();
    statusBarTintStore.subscribe(subscriber);

    act(() => {
      statusBarTintStore.set('#111');
    });
    expect(statusBarTintStore.getSnapshot()).toBe('#111');
    expect(subscriber).toHaveBeenCalledTimes(1);

    act(() => {
      statusBarTintStore.set('#111');
    });
    // Same value -> no re-emit.
    expect(subscriber).toHaveBeenCalledTimes(1);

    act(() => {
      statusBarTintStore.set('#222');
    });
    expect(subscriber).toHaveBeenCalledTimes(2);
  });
});
