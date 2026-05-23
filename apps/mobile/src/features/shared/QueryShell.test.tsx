/**
 * Unit tests for the QueryShell helper. Verifies the three render modes
 * (loading / error / passthrough) and the combineQueries reducer.
 */
import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import { Text as RNText } from 'react-native';
import { QueryShell, combineQueries } from './QueryShell';

function renderShell(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('QueryShell', () => {
  it('renders the LOADING… caps line when isLoading is true', () => {
    const screen = renderShell(
      <QueryShell query={{ isLoading: true }}>
        <RNText>child</RNText>
      </QueryShell>,
    );
    expect(screen.getByText('LOADING…')).toBeTruthy();
    expect(screen.queryByText('child')).toBeNull();
  });

  it("renders COULDN'T LOAD + error message + a Retry button when isError is true", () => {
    const refetch = jest.fn();
    const screen = renderShell(
      <QueryShell query={{ isError: true, error: new Error('boom'), refetch }}>
        <RNText>child</RNText>
      </QueryShell>,
    );
    expect(screen.getByText("COULDN'T LOAD")).toBeTruthy();
    expect(screen.getByText('boom')).toBeTruthy();
    fireEvent.press(screen.getByTestId('query-retry'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('does not render Retry when refetch is omitted', () => {
    const screen = renderShell(
      <QueryShell query={{ isError: true, error: new Error('boom') }}>
        <RNText>child</RNText>
      </QueryShell>,
    );
    expect(screen.queryByTestId('query-retry')).toBeNull();
  });

  it('renders children when neither loading nor errored', () => {
    const screen = renderShell(
      <QueryShell query={{}}>
        <RNText>child</RNText>
      </QueryShell>,
    );
    expect(screen.getByText('child')).toBeTruthy();
  });

  it('falls back to "Try again." when error has no message', () => {
    const screen = renderShell(
      <QueryShell query={{ isError: true }}>
        <RNText>child</RNText>
      </QueryShell>,
    );
    expect(screen.getByText('Try again.')).toBeTruthy();
  });
});

describe('combineQueries', () => {
  it('reports isLoading when any source is loading', () => {
    const combined = combineQueries({ isLoading: false }, { isLoading: true });
    expect(combined.isLoading).toBe(true);
  });

  it('reports isError + the first error when any source is errored', () => {
    const e = new Error('first');
    const combined = combineQueries(
      { isError: true, error: e },
      { isError: true, error: new Error('second') },
    );
    expect(combined.isError).toBe(true);
    expect(combined.error).toBe(e);
  });

  it('refetch calls refetch on every source that exposes one', async () => {
    const a = jest.fn();
    const b = jest.fn();
    const combined = combineQueries({ refetch: a }, { refetch: b }, {});
    await combined.refetch?.();
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });
});
