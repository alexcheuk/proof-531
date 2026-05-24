import { type ReactNode, createContext, createElement, useContext } from 'react';
import { colors, layout, motion, radii, spacing, type } from './tokens';

export type Theme = {
  colors: typeof colors;
  type: typeof type;
  radii: typeof radii;
  spacing: typeof spacing;
  layout: typeof layout;
  motion: typeof motion;
};

const themeValue: Theme = Object.freeze({
  colors,
  type,
  radii,
  spacing,
  layout,
  motion,
});

const ThemeContext = createContext<Theme | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) =>
  createElement(ThemeContext.Provider, { value: themeValue }, children);

export const useTheme = (): Theme => {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
};
