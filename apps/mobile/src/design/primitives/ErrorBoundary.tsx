import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { CapsLabel } from './CapsLabel';
import { Text } from './Text';

/**
 * Top-level error boundary. Without this, an uncaught render error in a
 * feature screen unmounts the React tree and the user is left staring at a
 * white surface with no way to recover short of a hard restart.
 *
 * The boundary catches the error, logs it for ops, and renders a paper-themed
 * recovery surface with a Reset button that re-mounts the children. State is
 * reset by bumping a key on the rendered subtree  -  React unmounts the prior
 * tree and re-mounts a fresh one, which clears any feature-local state that
 * provoked the crash.
 *
 * Class component because hooks cannot implement `componentDidCatch` / the
 * static `getDerivedStateFromError` lifecycle. The recovery surface is a
 * functional child so it can use the theme.
 */
export type ErrorBoundaryProps = {
  children: ReactNode;
  /** Custom fallback renderer. Defaults to the paper-themed recovery surface. */
  fallback?: (info: { error: Error; reset: () => void }) => ReactNode;
  /** Reported alongside the console.error so logs can be filtered by region. */
  scope?: string;
};

type State = { error: Error | null; resetKey: number };

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  override state: State = { error: null, resetKey: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[ErrorBoundary${this.props.scope ? ` · ${this.props.scope}` : ''}]`, error, {
      componentStack: info.componentStack,
    });
  }

  reset = (): void => {
    this.setState((prev) => ({ error: null, resetKey: prev.resetKey + 1 }));
  };

  override render(): ReactNode {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback({ error: this.state.error, reset: this.reset });
      }
      return <DefaultFallback error={this.state.error} reset={this.reset} />;
    }
    // Bump key on reset so the subtree fully remounts (clears any state that
    // would otherwise re-trigger the same crash).
    return (
      <View key={this.state.resetKey} style={{ flex: 1 }}>
        {this.props.children}
      </View>
    );
  }
}

function DefaultFallback({ error, reset }: { error: Error; reset: () => void }) {
  const { colors, spacing } = useTheme();
  const wrap: ViewStyle = {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: colors.bg0,
    paddingHorizontal: spacing.xl,
  };
  const resetButton: ViewStyle = {
    marginTop: spacing.xl,
    paddingVertical: 14,
    paddingHorizontal: 22,
    backgroundColor: colors.ink0,
    alignSelf: 'flex-start',
  };
  return (
    <View style={wrap} testID="error-boundary-fallback">
      <CapsLabel style={{ marginBottom: spacing.md }}>Something snapped</CapsLabel>
      <Text variant="sans" weight="bold" size={36} color="ink0" style={{ letterSpacing: -1.2 }}>
        Not your fault
        <Text variant="sans" weight="bold" size={36} color="amber">
          .
        </Text>
      </Text>
      <Text
        variant="sans"
        weight="regular"
        size={14}
        color="ink2"
        style={{ marginTop: spacing.md, maxWidth: 320, lineHeight: 21 }}
      >
        The app hit an unexpected error. Your training data is safe - tap Reset to try again.
      </Text>
      <Text
        variant="mono"
        weight="regular"
        size={10}
        color="ink3"
        style={{ marginTop: spacing.md, letterSpacing: 0.4 }}
      >
        {error.message || 'Unknown error'}
      </Text>
      <Pressable
        testID="error-boundary-reset"
        accessibilityRole="button"
        onPress={reset}
        style={resetButton}
      >
        <Text
          variant="sans"
          weight="semibold"
          size={13}
          color="bg0"
          style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
        >
          Reset
        </Text>
      </Pressable>
    </View>
  );
}
