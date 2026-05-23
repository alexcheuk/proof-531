import { render, renderHook } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemeProvider, useTheme } from './theme';
import { colors, motion, radii, spacing, type } from './tokens';

describe('ThemeProvider + useTheme', () => {
  it('returns the full token set when used inside ThemeProvider', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current).toEqual({
      colors,
      type,
      radii,
      spacing,
      motion,
    });
  });

  it('exposes the same token object references (no copies)', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.colors).toBe(colors);
    expect(result.current.type).toBe(type);
    expect(result.current.radii).toBe(radii);
    expect(result.current.spacing).toBe(spacing);
    expect(result.current.motion).toBe(motion);
  });

  it('throws when useTheme is called outside ThemeProvider', () => {
    const Consumer = () => {
      const theme = useTheme();
      return <Text>{theme.colors.bg0}</Text>;
    };

    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<Consumer />)).toThrow('useTheme must be used within ThemeProvider');
    } finally {
      spy.mockRestore();
    }
  });
});
