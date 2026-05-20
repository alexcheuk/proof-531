import { act, renderHook } from '@testing-library/react-native';
import type React from 'react';
import { ThemeProvider, useAccentOverride, useTheme } from '../theme';
import { accentSwatches, colors, motion, shape, type } from '../tokens';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('useTheme', () => {
  it('returns tokens unchanged when no override is active', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.colors).toEqual(colors);
    expect(result.current.type).toEqual(type);
    expect(result.current.shape).toEqual(shape);
    expect(result.current.motion).toEqual(motion);
  });
});

describe('useAccentOverride', () => {
  it('mutates only the `hot` accent — every other color stays constant', () => {
    const { result } = renderHook(() => ({ setAccent: useAccentOverride(), theme: useTheme() }), {
      wrapper,
    });

    const before = result.current.theme.colors;
    act(() => {
      result.current.setAccent('sage');
    });
    const after = result.current.theme.colors;

    expect(after.hot).toBe(accentSwatches.sage);
    expect(after.hot).not.toBe(before.hot);

    for (const key of Object.keys(colors) as Array<keyof typeof colors>) {
      if (key === 'hot') continue;
      expect(after[key]).toBe(colors[key]);
    }
  });
});
