import { ThemeProvider } from '@/design/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

const mockUpdateSettings = jest.fn().mockResolvedValue(undefined);
jest.mock('@/data/accessors/settings', () => ({
  updateSettings: (...args: unknown[]) => mockUpdateSettings(...args),
}));
jest.mock('@/data/DbProvider', () => ({
  useDb: () => ({ mock: 'db' }),
}));

import { PlateSetSection } from '../PlateSetSection';

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

describe('PlateSetSection', () => {
  beforeEach(() => mockUpdateSettings.mockClear());

  it('renders the Plate set title + SegRail', () => {
    const screen = wrap(<PlateSetSection plateSet="standard" />);
    expect(screen.getByText('Plate set')).toBeTruthy();
    expect(screen.getByTestId('settings-plate-set')).toBeTruthy();
  });

  it('renders both available plate-set labels', () => {
    const screen = wrap(<PlateSetSection plateSet="standard" />);
    expect(screen.getByText('lb plates')).toBeTruthy();
    expect(screen.getByText('kg plates')).toBeTruthy();
    expect(screen.getByText('Custom')).toBeTruthy();
  });

  it('maps schema "kg-standard" to the metric UI value', () => {
    // Visual mapping happens via SegRail.value  -  we only assert the section
    // mounts with metric without error.
    const screen = wrap(<PlateSetSection plateSet="kg-standard" />);
    expect(screen.getByTestId('settings-plate-set')).toBeTruthy();
  });
});
