import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { LiveHeader } from '../LiveHeader';

const renderHeader = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('LiveHeader', () => {
  it('renders the SET N OF 3 eyebrow + headline word on set 1', () => {
    const screen = renderHeader(
      <LiveHeader setIndex={0} isAmrap={false} lift="Squat" testID="header" />,
    );
    expect(screen.getByTestId('header')).toBeTruthy();
    expect(screen.getByText('SET 1 OF 3')).toBeTruthy();
    expect(screen.getByText(/Squat/)).toBeTruthy();
  });

  it('renders the set 2 progress hint', () => {
    const screen = renderHeader(<LiveHeader setIndex={1} isAmrap={false} lift="Squat" />);
    expect(screen.getByText('SET 2 OF 3 · 33% done')).toBeTruthy();
  });

  it('renders the FINAL SET eyebrow + AMRAP chip on set 3', () => {
    const screen = renderHeader(<LiveHeader setIndex={2} isAmrap lift="Bench" />);
    expect(screen.getByText('FINAL SET · 66% done')).toBeTruthy();
    expect(screen.getByText('AMRAP')).toBeTruthy();
  });

  it('renders the elapsed MM:SS badge when elapsedSeconds is provided', () => {
    const screen = renderHeader(
      <LiveHeader setIndex={0} isAmrap={false} lift="Squat" elapsedSeconds={75} testID="header" />,
    );
    expect(screen.getByText('01:15')).toBeTruthy();
    expect(screen.getByTestId('header-elapsed')).toBeTruthy();
  });

  it('omits the elapsed badge when elapsedSeconds is undefined', () => {
    const screen = renderHeader(
      <LiveHeader setIndex={0} isAmrap={false} lift="Squat" testID="header" />,
    );
    expect(screen.queryByTestId('header-elapsed')).toBeNull();
  });
});
