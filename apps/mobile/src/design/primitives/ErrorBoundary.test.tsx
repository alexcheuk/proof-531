import { fireEvent, render } from '@testing-library/react-native';
import { useState } from 'react';
import { Text as RNText } from 'react-native';
import { ThemeProvider } from '../theme';
import { ErrorBoundary } from './ErrorBoundary';

function Boom({ throwNow }: { throwNow: boolean }): React.ReactElement {
  if (throwNow) throw new Error('Test crash');
  return <RNText testID="ok">ok</RNText>;
}

function Harness() {
  const [crashed, setCrashed] = useState(true);
  return (
    <ErrorBoundary
      fallback={({ reset }) => (
        <RNText
          testID="custom-fallback"
          onPress={() => {
            setCrashed(false);
            reset();
          }}
        >
          recover
        </RNText>
      )}
    >
      <Boom throwNow={crashed} />
    </ErrorBoundary>
  );
}

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ErrorBoundary', () => {
  let errSpy: jest.SpyInstance;

  beforeEach(() => {
    errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    errSpy.mockRestore();
  });

  it('renders the default fallback when a child throws', () => {
    const { getByTestId } = renderWithTheme(
      <ErrorBoundary>
        <Boom throwNow />
      </ErrorBoundary>,
    );
    expect(getByTestId('error-boundary-fallback')).toBeTruthy();
  });

  it('renders the custom fallback when provided', () => {
    const { getByTestId } = renderWithTheme(<Harness />);
    expect(getByTestId('custom-fallback')).toBeTruthy();
  });

  it('resets the children when the fallback calls reset', () => {
    const { getByTestId } = renderWithTheme(<Harness />);
    fireEvent.press(getByTestId('custom-fallback'));
    expect(getByTestId('ok')).toBeTruthy();
  });
});
