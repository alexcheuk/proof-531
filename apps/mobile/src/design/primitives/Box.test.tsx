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
    const { getByTestId } = wrap(<Box testID="x" px="lg" py="sm" mx="md" my="xs" />);
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
