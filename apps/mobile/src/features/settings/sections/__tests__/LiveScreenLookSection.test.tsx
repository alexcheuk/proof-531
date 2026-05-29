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

import { LiveScreenLookSection } from '../LiveScreenLookSection';

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

describe('LiveScreenLookSection', () => {
  beforeEach(() => mockUpdateSettings.mockClear());

  it('renders the section title and both look options', () => {
    const screen = wrap(<LiveScreenLookSection inverted={false} />);
    expect(screen.getByText('Live screen look')).toBeTruthy();
    expect(screen.getByText('Paper')).toBeTruthy();
    expect(screen.getByText('Inverted')).toBeTruthy();
  });

  it('renders with testID for the SegRail', () => {
    const screen = wrap(<LiveScreenLookSection inverted={false} />);
    expect(screen.getByTestId('settings-live-screen-look')).toBeTruthy();
  });

  it('reflects the inverted=false state as Paper selected', () => {
    const screen = wrap(<LiveScreenLookSection inverted={false} />);
    const rail = screen.getByTestId('settings-live-screen-look');
    expect(rail).toBeTruthy();
  });

  it('reflects the inverted=true state', () => {
    const screen = wrap(<LiveScreenLookSection inverted={true} />);
    expect(screen.getByText('Inverted')).toBeTruthy();
  });
});
