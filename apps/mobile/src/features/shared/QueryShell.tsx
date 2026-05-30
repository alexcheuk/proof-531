import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { ReactNode } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';

export type QueryLike = {
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  refetch?: () => Promise<unknown> | undefined;
};

export function QueryShell({
  query,
  children,
  testID,
}: {
  query: QueryLike;
  children: ReactNode;
  testID?: string;
}) {
  const { colors, spacing } = useTheme();

  const baseStyle: ViewStyle = {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg0,
    padding: spacing.xl,
  };

  if (query.isLoading) {
    return (
      <View style={baseStyle} testID={testID ?? 'query-loading'}>
        <Text variant="mono" weight="medium" size={10} color="ink2" style={{ letterSpacing: 2.2 }}>
          LOADING…
        </Text>
      </View>
    );
  }

  if (query.isError) {
    const message = (query.error as Error | undefined)?.message ?? 'Try again.';
    return (
      <View style={{ ...baseStyle, gap: spacing.md }} testID={testID ?? 'query-error'}>
        <Text variant="mono" weight="medium" size={10} color="ink2" style={{ letterSpacing: 2.2 }}>
          COULDN'T LOAD
        </Text>
        <Text variant="sans" weight="regular" size={14} color="ink2">
          {String(message)}
        </Text>
        {query.refetch ? (
          <Pressable
            testID="query-retry"
            accessibilityRole="button"
            accessibilityLabel="Retry"
            onPress={() => {
              void query.refetch?.();
            }}
          >
            <Text
              variant="mono"
              weight="semibold"
              size={10}
              color="ink0"
              style={{ letterSpacing: 2.2 }}
            >
              RETRY
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return <>{children}</>;
}

export function combineQueries(...queries: QueryLike[]): QueryLike {
  const isLoading = queries.some((q) => q.isLoading);
  const errored = queries.find((q) => q.isError);
  const refetch = () => Promise.all(queries.map((q) => q.refetch?.()));
  return {
    isLoading,
    isError: errored !== undefined,
    error: errored?.error,
    refetch,
  };
}
