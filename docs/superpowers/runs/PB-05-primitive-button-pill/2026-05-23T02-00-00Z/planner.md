# Plan for PB-05-primitive-button-pill

## Approach
Two RN Pressable primitives at apps/mobile/src/design/primitives/. Both fire Haptics.impactAsync(Light) before onPress; never when disabled. accessibilityRole="button"; accessibilityState={{disabled}}. All colors via useTheme(). PWA-fidelity px literals (Button heights/paddings; pill 18×24/15/13/0.6) kept here — design/primitives is the only place allowed. Button is the multi-variant (default/outline/ghost × default/sm/lg/icon) ported from PWA cva. PrimaryPillButton is bespoke (label-left + glyph-right, borderRadius 0 squared "pill"). PWA's active:bg-ink-1 pressed-state styling is deferred (not in done_when).

## Files
- Create apps/mobile/src/design/primitives/Button.tsx
- Create apps/mobile/src/design/primitives/Button.test.tsx
- Create apps/mobile/src/design/primitives/PrimaryPillButton.tsx
- Create apps/mobile/src/design/primitives/PrimaryPillButton.test.tsx
- Modify apps/mobile/src/design/primitives/index.ts (add Button + PrimaryPillButton re-exports)

## Steps

### Step 1 — Button.tsx
```tsx
import type { ReactNode } from 'react';
import {
  Pressable,
  type StyleProp,
  Text as RNText,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme';

export type ButtonVariant = 'default' | 'outline' | 'ghost';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

type ButtonProps = {
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  children?: ReactNode;
  testID?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  onPress,
  variant = 'default',
  size = 'default',
  disabled = false,
  children,
  testID,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const { colors, radii } = useTheme();
  const base: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    opacity: disabled ? 0.5 : 1,
  };
  const variantStyle: ViewStyle =
    variant === 'default'
      ? { backgroundColor: colors.primary }
      : variant === 'outline'
        ? { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }
        : { backgroundColor: 'transparent' };
  const sizeStyle: ViewStyle =
    size === 'sm'
      ? { height: 36, paddingHorizontal: 12 }
      : size === 'lg'
        ? { height: 44, paddingHorizontal: 32 }
        : size === 'icon'
          ? { height: 40, width: 40 }
          : { height: 40, paddingHorizontal: 16, paddingVertical: 8 };
  const labelColor =
    variant === 'default' ? colors.primaryForeground : colors.foreground;
  const labelStyle: TextStyle = {
    fontSize: 14,
    fontWeight: '500',
    color: labelColor,
  };
  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };
  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={[base, variantStyle, sizeStyle, style]}
    >
      {typeof children === 'string' ? <RNText style={labelStyle}>{children}</RNText> : children}
    </Pressable>
  );
}
```

### Step 2 — Button.test.tsx
```tsx
import { fireEvent, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { ThemeProvider } from '../theme';
import { Button } from './Button';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

describe('Button', () => {
  beforeEach(() => { (Haptics.impactAsync as jest.Mock).mockClear(); });

  it('fires onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithTheme(<Button onPress={onPress} testID="btn">Go</Button>);
    fireEvent.press(getByTestId('btn'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  it('fires Haptics.impactAsync with light on press', () => {
    const { getByTestId } = renderWithTheme(<Button onPress={() => {}} testID="btn">Go</Button>);
    fireEvent.press(getByTestId('btn'));
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
  });
  it('exposes accessibilityRole="button"', () => {
    const { getByTestId } = renderWithTheme(<Button onPress={() => {}} testID="btn">Go</Button>);
    expect(getByTestId('btn').props.accessibilityRole).toBe('button');
  });
  it('does not fire onPress or haptics when disabled, and reports disabled state', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithTheme(<Button onPress={onPress} disabled testID="btn">Go</Button>);
    fireEvent.press(getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    expect(getByTestId('btn').props.accessibilityState).toEqual({ disabled: true });
  });
  it('renders children content', () => {
    const { getByText } = renderWithTheme(<Button onPress={() => {}}>Hello</Button>);
    expect(getByText('Hello')).toBeTruthy();
  });
});
```

### Step 3 — PrimaryPillButton.tsx
```tsx
import type { ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme';
import { Text } from './Text';

type PrimaryPillButtonProps = {
  onPress: () => void;
  glyph?: ReactNode;
  disabled?: boolean;
  children: ReactNode;
  testID?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryPillButton({
  onPress,
  glyph = '→',
  disabled = false,
  children,
  testID,
  accessibilityLabel,
  style,
}: PrimaryPillButtonProps) {
  const { colors } = useTheme();
  const container: ViewStyle = {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: disabled ? colors.ink3 : colors.ink0,
    borderRadius: 0,
  };
  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };
  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={[container, style]}
    >
      <Text variant="sans" weight="semibold" size={15} color="bg0" style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
        {children}
      </Text>
      {glyph !== undefined && glyph !== null ? (
        <Text variant="mono" weight="bold" size={13} color="bg0">{glyph}</Text>
      ) : null}
    </Pressable>
  );
}
```

### Step 4 — PrimaryPillButton.test.tsx
```tsx
import { fireEvent, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { ThemeProvider } from '../theme';
import { PrimaryPillButton } from './PrimaryPillButton';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

describe('PrimaryPillButton', () => {
  beforeEach(() => { (Haptics.impactAsync as jest.Mock).mockClear(); });

  it('fires onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithTheme(<PrimaryPillButton onPress={onPress} testID="cta">Begin</PrimaryPillButton>);
    fireEvent.press(getByTestId('cta'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  it('fires Haptics.impactAsync with light on press', () => {
    const { getByTestId } = renderWithTheme(<PrimaryPillButton onPress={() => {}} testID="cta">Begin</PrimaryPillButton>);
    fireEvent.press(getByTestId('cta'));
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
  });
  it('exposes accessibilityRole="button"', () => {
    const { getByTestId } = renderWithTheme(<PrimaryPillButton onPress={() => {}} testID="cta">Begin</PrimaryPillButton>);
    expect(getByTestId('cta').props.accessibilityRole).toBe('button');
  });
  it('does not fire onPress when disabled, and reports disabled state', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithTheme(<PrimaryPillButton onPress={onPress} disabled testID="cta">Begin</PrimaryPillButton>);
    fireEvent.press(getByTestId('cta'));
    expect(onPress).not.toHaveBeenCalled();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    expect(getByTestId('cta').props.accessibilityState).toEqual({ disabled: true });
  });
  it('renders the label and the default arrow glyph', () => {
    const { getByText } = renderWithTheme(<PrimaryPillButton onPress={() => {}}>Begin</PrimaryPillButton>);
    expect(getByText('Begin')).toBeTruthy();
    expect(getByText('→')).toBeTruthy();
  });
  it('renders a custom glyph when provided', () => {
    const { getByText } = renderWithTheme(<PrimaryPillButton onPress={() => {}} glyph="✓">Done</PrimaryPillButton>);
    expect(getByText('✓')).toBeTruthy();
  });
  it('omits the glyph when glyph={null}', () => {
    const { queryByText } = renderWithTheme(<PrimaryPillButton onPress={() => {}} glyph={null}>Done</PrimaryPillButton>);
    expect(queryByText('→')).toBeNull();
  });
});
```

### Step 5 — index.ts barrel
```ts
export { Box } from './Box';
export { Text } from './Text';
export { Button } from './Button';
export { PrimaryPillButton } from './PrimaryPillButton';
```

### Step 6 — Sweep + commit
```bash
pnpm --filter @fivethreeone/mobile typecheck
pnpm --filter @fivethreeone/mobile lint
pnpm --filter @fivethreeone/mobile test
git add apps/mobile/src/design/primitives/Button.tsx apps/mobile/src/design/primitives/Button.test.tsx \
        apps/mobile/src/design/primitives/PrimaryPillButton.tsx apps/mobile/src/design/primitives/PrimaryPillButton.test.tsx \
        apps/mobile/src/design/primitives/index.ts
git commit -m "feat(PB-05-primitive-button-pill): add Button and PrimaryPillButton primitives with haptics"
```
