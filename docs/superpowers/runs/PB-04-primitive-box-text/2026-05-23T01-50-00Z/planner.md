# Plan for PB-04-primitive-box-text

## Approach
Two pure, theme-driven primitives at apps/mobile/src/design/primitives/ + barrel + Jest tests, TDD.
- Box wraps View; props bg/p/px/py/m/mx/my/radius resolve via useTheme().
- Text wraps RNText; props variant ('sans'|'mono'|'condensed') × weight ('regular'|'medium'|'semibold'|'bold') × size:number + optional color. fontFamily computed by joining tokens.type.<variant> with `-${WEIGHT_SUFFIX[weight]}`. Default color theme.colors.ink0.
- Size kept as raw number (tokens.ts has no size scale; documented as option b).
- No hex/px literals in primitives. All values from useTheme().
- Barrel index.ts allowed per CLAUDE.md §5.

## Files
- Create apps/mobile/src/design/primitives/Box.tsx
- Create apps/mobile/src/design/primitives/Box.test.tsx
- Create apps/mobile/src/design/primitives/Text.tsx
- Create apps/mobile/src/design/primitives/Text.test.tsx
- Create apps/mobile/src/design/primitives/index.ts

## Steps

### Step 1 — Red: Box test
Create apps/mobile/src/design/primitives/Box.test.tsx:
```tsx
import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { ThemeProvider } from '../theme';
import { colors, radii, spacing } from '../tokens';
import { Box } from './Box';

const wrap = (ui: React.ReactNode) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('Box', () => {
  it('renders a node with given testID', () => {
    const { getByTestId } = wrap(<Box testID="x" />);
    expect(getByTestId('x')).toBeTruthy();
  });

  it('resolves bg/p/radius from tokens', () => {
    const { getByTestId } = wrap(<Box testID="x" bg="bg1" p="md" radius="md" />);
    const style = StyleSheet.flatten(getByTestId('x').props.style);
    expect(style).toMatchObject({
      backgroundColor: colors.bg1,
      padding: spacing.md,
      borderRadius: radii.md,
    });
  });

  it('resolves px/py/mx/my from tokens', () => {
    const { getByTestId } = wrap(
      <Box testID="x" px="lg" py="sm" mx="md" my="xs" />,
    );
    const style = StyleSheet.flatten(getByTestId('x').props.style);
    expect(style).toMatchObject({
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      marginHorizontal: spacing.md,
      marginVertical: spacing.xs,
    });
  });

  it('merges user-supplied style last', () => {
    const { getByTestId } = wrap(<Box testID="x" style={{ opacity: 0.5 }} />);
    const style = StyleSheet.flatten(getByTestId('x').props.style);
    expect(style.opacity).toBe(0.5);
  });
});
```
Run `pnpm --filter @fivethreeone/mobile test Box` → expect FAIL.

### Step 2 — Green: Box implementation
Create apps/mobile/src/design/primitives/Box.tsx:
```tsx
import type { ReactNode } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import type { ColorToken, RadiusToken, SpacingToken } from '../tokens';

type BoxProps = {
  bg?: ColorToken;
  p?: SpacingToken;
  px?: SpacingToken;
  py?: SpacingToken;
  m?: SpacingToken;
  mx?: SpacingToken;
  my?: SpacingToken;
  radius?: RadiusToken;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  testID?: string;
};

export function Box({ bg, p, px, py, m, mx, my, radius, style, children, testID }: BoxProps) {
  const { colors, spacing, radii } = useTheme();
  const resolved: ViewStyle = {};
  if (bg) resolved.backgroundColor = colors[bg];
  if (p) resolved.padding = spacing[p];
  if (px) resolved.paddingHorizontal = spacing[px];
  if (py) resolved.paddingVertical = spacing[py];
  if (m) resolved.margin = spacing[m];
  if (mx) resolved.marginHorizontal = spacing[mx];
  if (my) resolved.marginVertical = spacing[my];
  if (radius) resolved.borderRadius = radii[radius];
  return (
    <View testID={testID} style={[resolved, style]}>
      {children}
    </View>
  );
}
```
Run Box test → PASS.

### Step 3 — Red: Text test
Create apps/mobile/src/design/primitives/Text.test.tsx:
```tsx
import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { ThemeProvider } from '../theme';
import { colors } from '../tokens';
import { Text } from './Text';

const wrap = (ui: React.ReactNode) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('Text', () => {
  it('renders text content', () => {
    const { getByText } = wrap(
      <Text variant="sans" weight="regular" size={14}>hello</Text>,
    );
    expect(getByText('hello')).toBeTruthy();
  });

  it('maps sans+regular → IBMPlexSans-Regular', () => {
    const { getByText } = wrap(
      <Text variant="sans" weight="regular" size={16}>x</Text>,
    );
    const style = StyleSheet.flatten(getByText('x').props.style);
    expect(style.fontFamily).toBe('IBMPlexSans-Regular');
    expect(style.fontSize).toBe(16);
  });

  it('maps mono+semibold → IBMPlexMono-SemiBold', () => {
    const { getByText } = wrap(
      <Text variant="mono" weight="semibold" size={14}>x</Text>,
    );
    const style = StyleSheet.flatten(getByText('x').props.style);
    expect(style.fontFamily).toBe('IBMPlexMono-SemiBold');
  });

  it('maps condensed+bold → IBMPlexSansCondensed-Bold', () => {
    const { getByText } = wrap(
      <Text variant="condensed" weight="bold" size={20}>x</Text>,
    );
    const style = StyleSheet.flatten(getByText('x').props.style);
    expect(style.fontFamily).toBe('IBMPlexSansCondensed-Bold');
  });

  it('defaults color to ink0; color prop overrides', () => {
    const { getByText, rerender } = wrap(
      <Text variant="sans" weight="regular" size={12}>a</Text>,
    );
    let style = StyleSheet.flatten(getByText('a').props.style);
    expect(style.color).toBe(colors.ink0);

    rerender(
      <ThemeProvider>
        <Text variant="sans" weight="regular" size={12} color="ink2">a</Text>
      </ThemeProvider>,
    );
    style = StyleSheet.flatten(getByText('a').props.style);
    expect(style.color).toBe(colors.ink2);
  });

  it('merges user style last', () => {
    const { getByText } = wrap(
      <Text variant="sans" weight="regular" size={12} style={{ letterSpacing: 1 }}>a</Text>,
    );
    const style = StyleSheet.flatten(getByText('a').props.style);
    expect(style.letterSpacing).toBe(1);
  });
});
```

### Step 4 — Green: Text implementation
Create apps/mobile/src/design/primitives/Text.tsx:
```tsx
import type { ReactNode } from 'react';
import { Text as RNText, type StyleProp, type TextStyle } from 'react-native';
import { useTheme } from '../theme';
import type { ColorToken } from '../tokens';

// Size is taken as a raw number (px) because tokens.ts has no font-size scale.
// fontFamily/color come from tokens. Downstream tasks may add a size scale.
const WEIGHT_SUFFIX = {
  regular: 'Regular',
  medium: 'Medium',
  semibold: 'SemiBold',
  bold: 'Bold',
} as const;

type TextProps = {
  variant: 'sans' | 'mono' | 'condensed';
  weight: 'regular' | 'medium' | 'semibold' | 'bold';
  size: number;
  color?: ColorToken;
  style?: StyleProp<TextStyle>;
  children?: ReactNode;
  testID?: string;
  numberOfLines?: number;
};

export function Text({
  variant,
  weight,
  size,
  color,
  style,
  children,
  testID,
  numberOfLines,
}: TextProps) {
  const { type, colors } = useTheme();
  const baseFamily =
    variant === 'sans' ? type.sans : variant === 'mono' ? type.mono : type.displayCond;
  const fontFamily = `${baseFamily}-${WEIGHT_SUFFIX[weight]}`;
  const resolved: TextStyle = {
    fontFamily,
    fontSize: size,
    color: colors[color ?? 'ink0'],
  };
  return (
    <RNText testID={testID} numberOfLines={numberOfLines} style={[resolved, style]}>
      {children}
    </RNText>
  );
}
```

### Step 5 — Barrel
Create apps/mobile/src/design/primitives/index.ts:
```ts
export { Box } from './Box';
export { Text } from './Text';
```

### Step 6 — Sweep
```
pnpm --filter @fivethreeone/mobile typecheck
pnpm --filter @fivethreeone/mobile lint
pnpm --filter @fivethreeone/mobile test
rg -n '#[0-9a-fA-F]{3,8}' apps/mobile/src/design/primitives   # expect empty
```

### Step 7 — Commit
```
git add apps/mobile/src/design/primitives/
git commit -m "feat(PB-04-primitive-box-text): add Box and Text primitives with token-driven styles"
```
