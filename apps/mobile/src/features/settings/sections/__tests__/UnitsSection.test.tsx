import { ThemeProvider } from '@/design/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

const mockSetDisplayUnit = jest.fn().mockResolvedValue(undefined);
jest.mock('@/data/accessors/settings', () => ({
  setDisplayUnit: (...args: unknown[]) => mockSetDisplayUnit(...args),
}));
jest.mock('@/data/DbProvider', () => ({
  useDb: () => ({ mock: 'db' }),
}));

import { UnitsSection } from '../UnitsSection';

function wrap(ui: ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ThemeProvider>{ui}</ThemeProvider>
    </QueryClientProvider>,
  );
}

describe('UnitsSection', () => {
  beforeEach(() => mockSetDisplayUnit.mockClear());

  it('renders the Units title + both SegRails + helper captions', () => {
    const screen = wrap(
      <UnitsSection storageUnit="lbs" displayUnit="lbs" onStorageRequest={() => {}} />,
    );
    expect(screen.getByText('Units')).toBeTruthy();
    expect(screen.getByText('Training unit')).toBeTruthy();
    expect(screen.getByText('Display unit')).toBeTruthy();
    expect(screen.getByTestId('settings-storage-unit')).toBeTruthy();
    expect(screen.getByTestId('settings-display-unit')).toBeTruthy();
    expect(screen.getByText('flipping converts your training maxes')).toBeTruthy();
    expect(screen.getByText('changes how weights are shown · no data change')).toBeTruthy();
  });

  it('renders both unit option labels', () => {
    const screen = wrap(
      <UnitsSection storageUnit="lbs" displayUnit="kg" onStorageRequest={() => {}} />,
    );
    // Each label appears in both SegRails.
    expect(screen.queryAllByText('Pounds · lb').length).toBeGreaterThanOrEqual(2);
    expect(screen.queryAllByText('Kilograms · kg').length).toBeGreaterThanOrEqual(2);
  });
});
